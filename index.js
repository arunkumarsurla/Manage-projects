let currentPage = 1;
const itemsPerPage = 8;
let totalPages = 1;

const prevBtn = document.getElementById("prev-button");
const nextBtn = document.getElementById("next-button");
const pageNumbers = document.getElementById("page-numbers");
const apiEndpoint =
  "https://668d0469099db4c579f16037.mockapi.io/api/data/projectData";
let allProjectsData = [];


const ADMIN_EMAIL = "arunkumar@example.com";
const loggedInUser = localStorage.getItem("userEmail") || "";

function isAdmin() {
  return loggedInUser === ADMIN_EMAIL;
}

function login() {
  const email = document.getElementById("adminEmail").value;
  localStorage.setItem("userEmail", email);
  location.reload();
}

  // Hide all admin-only elements for non-admins
  if (!isAdmin()) {
    document.querySelectorAll(".admin-only").forEach(el => {
      el.style.display = "none";
    });
  }

document.addEventListener("DOMContentLoaded", () => {
  fetchProjects();
  document.getElementById("projectsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const projectId = document.getElementById("projectid").value;
    const formData = getFormData();

    if (projectId) {
      updateProjectData(projectId, formData);
    } else {
      insertProjectData(formData);
    }
    $("#projectsModal").modal("hide");
  });
});

function searchProjects() {
  const query = document.getElementById("searchInput").value.toUpperCase();
  const filteredProjects = allProjectsData.filter((project) =>
    project.projectTitle.toUpperCase().includes(query)
  );
  displayProjects(filteredProjects);
  document.getElementById("noProjectsMessage").innerHTML =
    "No projects found matching the search criteria.";
}

async function fetchProjects() {
  const projectsData = document.getElementById("projectsData");
  showLoading();
  try {
    const response = await fetch(apiEndpoint);
    const projects = await response.json();
    allProjectsData = projects;
    totalPages = Math.ceil(allProjectsData.length / itemsPerPage);
    updatePagination();
    displayProjects(getCurrentPageProjects());
  } catch (error) {
    console.log(error);
  }
  hideLoading();
}

function getCurrentPageProjects() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  console.log("startIndex: ", startIndex);
  const endIndex = startIndex + itemsPerPage;
  console.log("endIndex: ", endIndex);

  const currentPageProjects = allProjectsData.slice(startIndex, endIndex);
  return currentPageProjects;
}

function displayProjects(projects) {
  const projectsData = document.getElementById("projectsData");
  let htmlData = "";
  projectsData.innerHTML = "";
  if (projects.length === 0) {
    document.getElementById("noProjectsMessage").style.display = "block";
  } else {
    document.getElementById("noProjectsMessage").style.display = "none";
    document.getElementById("paginationContainer").style.display = "block";

    projects.forEach((project) => {
      htmlData += `
                <div class="col-12 col-md-6 col-lg-3" id="project-${project.id}">
                    <div class="project-section shadow p-3 mb-3">
                        <img src="${project.projectImg}" alt="${project.id}" class="project-image w-100" />
                        <h1 class="project-title">${project.projectTitle}</h1>
                        <small class="project-description">${project.projectDescription}</small>
                      
                        <div class="d-flex justify-content-between mt-3">
                            <a href="${project.projectUrl}" class="project-link" target="_blank">
                                View Project
                                <svg width="16px" height="16px" viewBox="0 0 16 16" class="bi bi-arrow-right-short" fill="#64ffda" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z" />
                                </svg>
                            </a>
                            <div class="edit-button admin-only" onclick="editRecord(${project.id})">
                                <a href="javascript:void(0)">
                                    <i class="fa fa-edit" style="color:green"></i>
                                </a>
                            </div>
                            <div class="delete-button admin-only"  onclick="deleteRecord(${project.id})">
                                <a href="javascript:void(0)">
                                    <i class="fa fa-trash" style="color:red"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    });
    projectsData.innerHTML = htmlData;
    if (!isAdmin()) {
      document.querySelectorAll(".admin-only").forEach(el => {
        el.style.display = "none";
      });
    }
  }
}

function changePage(direction) {
  if (direction === "prev" && currentPage > 1) {
    currentPage--;
  } else if (direction === "next" && currentPage < totalPages) {
    currentPage++;
  }
  updatePagination();
  displayProjects(getCurrentPageProjects());
}

function updatePagination() {
  pageNumbers.innerHTML = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

function addProject() {
  document.getElementById("projectsForm").reset();
  $("#projectsModal").modal("show");
}

async function insertProjectData(formData) {
  showFormLoader();
  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error("Error in creating project");

    const result = await response.json();
    document.getElementById("projectsForm").reset();
    fetchProjects();
    displayResponse("Project created successfully!", "success");
  } catch (error) {
    console.error("Error:", error);
    displayResponse("Error creating project.", "error");
  } finally {
    hideFormLoader();
  }
}

function editRecord(id) {
  $("#projectsModal").modal("show");
  showFormLoader();
  fetch(`${apiEndpoint}/${id}`)
    .then((response) => response.json())
    .then((project) => {
      document.getElementById("projectid").value = project.id;
      document.getElementById("projectTitle").value = project.projectTitle;
      document.getElementById("projectdescription").value = project.projectDescription;
      document.getElementById("projecturl").value = project.projectUrl;
      document.getElementById("logourl").value = project.logoPng;
      document.getElementById("projectimageurl").value = project.projectImg;
      document.getElementById("projectsModalLabel").innerText =
        "Edit Project Details";
      hideFormLoader();
    })
    .catch((error) => console.error("Error fetching project data:", error));
}

async function updateProjectData(id, formData) {
  showFormLoader();
  try {
    const response = await fetch(`${apiEndpoint}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) throw new Error("Error in updating project");
    const result = await response.json();
    displayResponse("Project updated successfully!", "success");
    fetchProjects();
    document.getElementById("projectsForm").reset();
  } catch (error) {
    console.error("Error:", error);
    displayResponse("Error updating project.", "error");
  } finally {
    hideFormLoader();
  }
}

function deleteRecord(id) {
  if (confirm("Are you sure you want to delete this project?") == true) {
    fetch(`${apiEndpoint}/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(() => {
        document.getElementById(`project-${id}`).remove();
        displayResponse("Project Successfully Deleted", "success");

        const remainingProjects = document.querySelectorAll(
          "#projectsData .project-section"
        );
        if (remainingProjects.length === 0) {
          fetchProjects();
        }
      })
      .catch((error) => console.error("Error deleting record:", error));
  }
}

function showFormLoader() {
  const loader = document.getElementById("formLoader");
  loader.style.display = "block";
  loader.classList.add("spinner");
}

function hideFormLoader() {
  const loader = document.getElementById("formLoader");
  loader.style.display = "none";
  loader.classList.remove("spinner");
}

function getFormData() {
  return {
    projectId: document.getElementById("projectid").value,
    projectTitle: document.getElementById("projectTitle").value,
    projectDescription: document.getElementById("projectdescription").value,
    projectUrl: document.getElementById("projecturl").value,
    logoPng: document.getElementById("logourl").value,
    projectImg: document.getElementById("projectimageurl").value,
  };
}

function showLoading() {
  document.getElementById("loading").style.display = "block";
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

function displayResponse(message, status) {
  const spanElement = document.getElementById("span");
  const modalBody = document.querySelector("#popUpModal .modal-body");

  if (status === "success") {
    spanElement.style.color = "#64ffda";
    modalBody.innerHTML = `<h4 style="color: #64ffda;">${message} <i style="color: #64ffda;" class="fa-solid fa-check"></i> </h4>`;
  } else if (status === "error") {
    spanElement.style.color = "#64ffda";
    modalBody.innerHTML = `<h4 style="color:#64ffda ;">${message}<i style="color:#64ffda;" class="fa-solid fa-circle-xmark"></i></h4>`;
  }
  $("#popUpModal").modal("show");
  setTimeout(() => {
    $("#popUpModal").modal("hide");
  }, 1500);
}
