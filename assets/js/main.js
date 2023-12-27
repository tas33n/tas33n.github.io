/*=============== FILTERS TABS ===============*/
const tabs = document.querySelectorAll('[data-target]'),
    tabContents = document.querySelectorAll('[data-content]')

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = document.querySelector(tab.dataset.target)

        tabContents.forEach(tc => {
            tc.classList.remove('filters__active')
        })
        target.classList.add('filters__active')

        tabs.forEach(t => {
            t.classList.remove('filter-tab-active')
        })
        tab.classList.add('filter-tab-active')
    })
})

/*=============== DARK LIGHT THEME ===============*/
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'ri-sun-line'

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ri-moon-line' : 'ri-sun-line'

// We validate if the user previously chose a topic
if (selectedTheme) {
    // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
    document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
    themeButton.classList[selectedIcon === 'ri-moon-line' ? 'add' : 'remove'](iconTheme)
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener('click', () => {
    // Add or remove the dark / icon theme
    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    // We save the theme and the current icon that the user chose
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})

/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2500,
    delay: 400,
})

sr.reveal(`.profile__border`)
sr.reveal(`.profile__name`, { delay: 500 })
sr.reveal(`.profile__profession`, { delay: 600 })
sr.reveal(`.profile__social`, { delay: 700 })
sr.reveal(`.profile__info-group`, { interval: 100, delay: 700 })
sr.reveal(`.profile__buttons`, { delay: 800 })
sr.reveal(`.filters__content`, { delay: 900 })
sr.reveal(`.filters`, { delay: 1000 })

/*=============== COUNTER ANIMATION ===============*/
function animateCounter(divId) {
    const div = document.getElementById(divId);
    let counterInterval;

    function animate() {
        counterInterval = setInterval(() => {
            const randomNumber = Math.floor(Math.random() * 900) + 100;
            div.innerHTML = randomNumber.toString().padStart(3, "0");
        }, 50);

        setTimeout(() => {
            clearInterval(counterInterval);
            setTimeout(animate, 1000);
        }, 3000);
    }

    animate();
}

/////////////////////////////// Portfolio Starts here /////////////////////////////////

document.addEventListener('DOMContentLoaded', function () {
    const loadingDiv = document.getElementById('loading');
    const projectsContainer = document.getElementById('projects');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let repoData = [];
    let projectsToShow = 10;
    loadingDiv.style.display = 'block';

    // Make an API call to get user data
    fetch('https://api.github.com/users/tas33n')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            loadingDiv.style.display = 'none';

            // Update profile information
            document.getElementById('profileImage').src = data.avatar_url;
            document.querySelector('.profile__name').innerText = data.name || 'Farhan Isteak Taeen';
            document.querySelector('.profile__profession').innerText = data.bio || 'Fullstack Web developer.';
            document.getElementById('YearsOfWork').innerText = Math.floor((new Date() - new Date(data.created_at)) / (1000 * 60 * 60 * 24 * 365.25)).toString();
            document.getElementById('CompleteProjects').innerText = data.public_repos;
            animateCounter('satisfiedCustomers');
        })
        .catch(error => {
            console.error('Error fetching GitHub data:', error);
            // If API request fails, try reading from the local JSON file
            fetch('/assets/profile-response.json')
                .then(response => response.json())
                .then(data => {
                    loadingDiv.style.display = 'none';

                    /******************************************************************************
                             get your own graphql from : https://docs.github.com/en/graphql/overview/explorer
                              the graph query is : "{
                                                  user(login: "tas33n") {
                                                    name
                                                    avatarUrl
                                                    bio
                                                    company
                                                    location
                                                    createdAt
                                                    updatedAt
                                                    websiteUrl
                                                    repositories {
                                                      totalCount
                                                    }
                                                    followers {
                                                      totalCount
                                                    }
                                                    following {
                                                      totalCount
                                                    }
                                                    starredRepositories {
                                                      totalCount
                                                    }
                                                  }
                                                }"

                     Note: Replace "Tas33n" with your own username and store the josn response in assets folder..

                    *****************************************************************************************/

                    // Update profile information using local JSON file
                    document.getElementById('profileImage').src = data.data.user.avatarUrl;
                    document.querySelector('.profile__name').innerText = data.data.user.name || 'Farhan Isteak Taeen';
                    document.querySelector('.profile__profession').innerText = data.data.user.bio || 'Fullstack Web developer.';
                    document.getElementById('YearsOfWork').innerText = Math.floor((new Date() - new Date(data.data.user.createdAt)) / (1000 * 60 * 60 * 24 * 365.25)).toString();
                    document.getElementById('CompleteProjects').innerText = data.data.user.repositories.totalCount;
                    animateCounter('satisfiedCustomers');
                })
                .catch(localError => {
                    console.error('Error reading local JSON file:', localError);
                    loadingDiv.innerText = 'Error loading data.';
                });
        });

    /******************************************************************************
     get your own graphql from : https://docs.github.com/en/graphql/overview/explorer
     the graph query is : "{
      user(login: "tas33n") {
        repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
          nodes {
            id
            name
            nameWithOwner
            description
            isPrivate
            isFork
            pushedAt
            visibility
            createdAt
            updatedAt
            url
            forks {
              totalCount
            }
            primaryLanguage {
              name
            }
          }
        }
      }
    }"

    Note: Replace "Tas33n" with your own username and store the josn response in assets folder..

    *****************************************************************************************/

    // Make an API call to get repository data
    fetch('/assets/repos-response.json')
        .then(response => response.json())
        .then(data => {
            repoData = data;
            loadingDiv.style.display = 'none';
            displayProjects(projectsToShow);
        })
        .catch(error => {
            console.error('Error fetching GitHub projects:', error);
            loadingDiv.innerText = 'Error loading projects.';
        });
    loadMoreBtn.addEventListener('click', function () {
        projectsToShow += 10;
        displayProjects(projectsToShow);
    });

    function displayProjects(count) {
        projectsContainer.innerHTML = '';
        repoData.data.user.repositories.nodes.slice(0, count).forEach(project => {
            const article = document.createElement('article');
            article.classList.add('projects__card');

            article.innerHTML = `
        <img src="https://opengraph.githubassets.com/92493f06109f0a5f86a8c2a7fec2bc5643fad91d39321607c4f16ecb59e48df5/${project.nameWithOwner}" alt="" class="projects__img">
        <div class="projects__modal">
            <div>
                <span class="projects__subtitle">${project.name}</span>
                <h3 class="projects__title">${project.description || 'No description available'}</h3>
                <a href="${project.url}" class="projects__button button button__small" target="_blank">
                    <i class="ri-link"></i>
                </a>
            </div>
        </div>
    `;
            projectsContainer.appendChild(article);
        });
    }
});