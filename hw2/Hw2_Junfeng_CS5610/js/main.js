/* This file is to define the operating logic for js.*/

// For shared navigation
const mainNav = document.getElementById("main-nav");

if (mainNav) {

  mainNav.innerHTML = `
    <a href="/">
      <img src="/Material/acme-logo.svg" alt="Acme Corp">
    </a>

    <ul id="nav-list"></ul>
  `;
    //  <!-- Define the structure for the navigtation menu.-->
    // <!--a creates a hyperlink, and href specifies the destination URL. -->
    // <!-- alt means that when the image can't be loaded, the text in alt will be shown.-->
    // <!-- This part is for the logo.-->

  const navList = document.getElementById("nav-list");

  navItems.forEach(function(navItem) {

    const item = document.createElement("li");

    item.innerHTML = `
      <a href="${navItem.link}">
        ${navItem.name}
      </a>
    `;

            // <!-- This part is for the navigation menu..-->
            // <!-- li is the label of the list item in ul. And the <a> is the label of hyperlink-->
            // <!-- The text Products is the content we will see in the webpage.-->

    navList.appendChild(item);

  });

}




const productList = document.getElementById("product-list");
/* Search the element whose <div id is product-list> and store it in productList. */

if (productList) {
  products.forEach(function(product) {
    /* For each element in products should execute the following opearation.*/
    const productItem = document.createElement("div");
    // Create a new div element and store it in productItem.
    productItem.innerHTML = `
      <h2>${product.name}</h2>
      <p>${product.description}</p>
    `;
    // Set the html information for the div block, like setting the name and description.

    productList.appendChild(productItem);
    // Add this productItem into the productList.
  });
}


const caseStudyList = document.getElementById("case-study-list");
/* Search the element whose <ul id is case-study-list>. in html file and store it in caseStudyList.*/
if (caseStudyList) {
  caseStudies.forEach(function(caseStudy) {
    /* Loop through each case study.*/
    const item = document.createElement("li");
        // Create a new list element and store it in item.
    item.className = "case-study-item";
    // Add a class name for the item, so that the html file can link this element with the css funciton .case-study-item{}.

    item.innerHTML = `
      <div class="case-study-title-row">

        <h2>
          <a href="${caseStudy.link}">
            ${caseStudy.title}
          </a>
        </h2>

        ${caseStudy.gated ? '<span class="badge">Gated</span>' : ''}

      </div>

      <p>${caseStudy.summary}</p>
    `;
    // Set the html information for the ul <ul id="case-study-list"> block, like setting the name and description.
        
    caseStudyList.appendChild(item);
  });
}


// for Case_study_ two html file
const accessForm = document.getElementById("access-form");
/* Find the form with the id "access-form".*/
const gatedAccessBox = document.getElementById("gated-access-box");
/* Search the element whose <div id is gated-access-box>. in html file and store it in gatedAccessBox.*/
const gatedContent = document.getElementById("gated-content");
/* Search the element whose <div id is gated-content>. in html file and store it in gatedContent.*/
if (accessForm) {
  accessForm.addEventListener("submit", function(event) {
    // Add a listener to monitor the submit. If the submit is clicked, will add an event.

    event.preventDefault();
    // It prevents the form from submitting and refreshing the page, so we can handle the submit event with JavaScript instead.
    gatedAccessBox.classList.add("hidden");
    // After submitting the email address, the hidden class int the existing class. Then with the css .hidden {}, the class will not be displayed.
    gatedContent.classList.remove("hidden");
    // Remove the hidden class in the existing class. Then the class will be displayed again.

  });
}


// For adding the team member into the html.
// For about.html
const teamList = document.getElementById("team-list");
/* Search the element whose id is team-list and store it in teamList. */

if (teamList) {

  teamMembers.forEach(function(member) {
    /* For each object in teamMembers, create one team member item. */

    const item = document.createElement("li");
    // Create a new <li> element.

    item.className = "team-member";
    // Add a class name so CSS can style each team member.

    item.innerHTML = `
      <img src="${member.image}" alt="${member.name}" class="team-member-image">

      <div class="team-member-info">

        <p class="team-member-name">${member.name}</p>

        <p class="team-member-role">${member.role}</p>

        <p>${member.bio1}</p>

        <p>${member.bio2}</p>

      </div>
    `;
    // Insert the member's image, name, role and bio into the <li>.

    teamList.appendChild(item);
    // Add the completed <li> into the <ul id="team-list">.
  });

}


// For contact.html
const contactForm = document.getElementById("contact-form");
const contactSuccess = document.getElementById("contact-success");

if (contactForm) {

  contactForm.addEventListener("submit", function(event) {

    event.preventDefault();
    // Stop the browser from refreshing or sending the form somewhere.

    window.location.href = "contact_success.html";

  });

}