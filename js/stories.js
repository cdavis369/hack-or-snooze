"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 * - userStory: toggle trash can icon for user's "my favorite" list
 * - a favorite icon if user is logged in
 * - a delete icon if user's "my story" list is being rendered
 * Returns the markup for the story.
 */
function generateStoryMarkup(story, userStory = false) {
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      ${favoriteIcon(story)}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small><br>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}  ${userStory? deleteIcon() : ""}</small>
      </li>
    `);
}

/**
 * check if user is logged in
 * check if story is a favorite of user
 * return rendered html
 */
function favoriteIcon(story) {
  if (currentUser) {
    return `<span class="favorite">
              <i class="${checkIfFavorite(story)}" id="star"></i>
            </span>`;
  }
  return "";
}

/**
 * if story is a favorite then star is filled
 * otherwise star is hollow
 */
function checkIfFavorite(story) {
  const match = currentUser.favorites.find((s) => s.storyId === story.storyId);
  if (match)
    return "fa-sharp fa-solid fa-star";
  return "fa-sharp fa-regular fa-star";
}

/** return trash can icon */
function deleteIcon() {
  return `<span class="delete">
            <i class="fa-regular fa-trash-can"></i>
         </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  hidePageComponents();
  $allStoriesList.show();

  // generate HTML for remaining stories if logged in
  if (currentUser) {
    putFavoritesOnPage();
    putUserStoriesOnPage();
  }
}

/** iterate through user's favorite stories and get HTML for each */
function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");
  $favoritesList.empty();
  const stories = currentUser.favorites;
  if (stories.length) 
    currentUser.favorites.forEach(story => $favoritesList.append(generateStoryMarkup(story)));
  else
    $favoritesList.append("You have no favorites.");
}

/** 
 * toggle userStory to get delete icon
 * iterate through user's own stories and get HTML for each
 */
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");
  $userStoriesList.empty();
  const stories = currentUser.ownStories;
  const userStory = true;
  if (stories.length)
    stories.forEach(story => $userStoriesList.append(generateStoryMarkup(story, userStory)));
  else 
    $userStoriesList.append("You have no stories.")
}

/** 
 * handle on click on submit for new story
 * create new instance of story
 * add new story and rebuild lists
 */
async function submitNewStory(evt) {
  console.debug("submitNewStory")
  evt.preventDefault();
  const story = await Story.newStory();
  currentUser.ownStories.push(story);
  $submitForm.hide();
  getAndShowStoriesOnStart();
}

$("#submit-story-form").on("submit", submitNewStory);

/**
 * handle on click on favorite icon
 * get story from stories list
 * add favorite if star is hollow
 * remove favorite if star is filled
 * rebuild favorites list
 */

async function handleStarClick($star) {
  console.debug("handleStarClick");
  const storyId = $star.closest("LI").attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);
  await starClickHelper($star, story);
  putStoriesOnPage();
}

async function starClickHelper($star, story) {
  if ($star.hasClass("fa-regular")) {
    $star.attr("class", "fa-star fa-solid fa-sharp");
    await currentUser.addFavorite(story);
  }
  else {
    $star.attr("class", "fa-star fa-regular fa-sharp");
    await currentUser.deleteFavorite(story);
  }
}

$(".stories-container").on("click", ".favorite", (evt) => handleStarClick($(evt.target)));

/**
 * handle click on delete icon
 * get story from user's stories
 * delete story from user object and via API
 * rebuild all stories/user's stories list
 */

async function handleDeleteClick($trash) {
  console.debug("handleDeleteClick");
  const storyId = $trash.closest("LI").attr("id");;
  currentUser.ownStories = currentUser.ownStories.filter((s) => s.storyId !== storyId);
  const story = storyList.stories.find(s => s.storyId === storyId);
  await Story.deleteUserStory(story);
  storyList = await StoryList.getStories();
  putStoriesOnPage();
  $allStoriesList.hide();
  $userStoriesList.show();
}

$(".stories-container").on("click", ".delete", (evt) => handleDeleteClick($(evt.target)));