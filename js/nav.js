"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $navLogin.hide();
  $(".nav-left").show();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Hide all forums and lists except the submit form on click on "submit" */

function navSubmitClick() {
  console.debug("navSubmitClick");
  hidePageComponents();
  $submitForm.show();
}

$navSubmit.on("click", navSubmitClick);

/** Hide all forums and lists except the favorites list on click on "favorites" */

function navFavoritesClick() {
  console.debug("navFavoritesClick");
  hidePageComponents();
  $favoritesList.show();
}

$navFavorites.on("click", navFavoritesClick);

/** Hide all forums and lists except user's own stories on click on "my stories" */

function navStoriesClick() {
  console.debug("navStoriesClick");
  hidePageComponents();
  $userStoriesList.show();
}

$navStories.on("click", navStoriesClick);
