// API Key obtained from OMDB API
const apiKey = "2630f0b6";
let reviews = {
  "tt11783766" : {
        rating: 3,
        comment: "Good moview overall"
  }
}
    


let movieReviews = JSON.parse(localStorage.getItem("movieReviews"));
if(movieReviews) reviews = movieReviews;
console.log(reviews)
// Fetch movie data from OMDB API
async function fetchMovies(searchQuery, page = 1) {
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${searchQuery}&page=${page}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching movies:", error);
        return null;
    }
}

// Function to display movie list
function displayMovies(movies) {
    // Clear previous movie list
    const movieListContainer = document.getElementById("movieList");
    movieListContainer.innerHTML = "";

    // Loop through each movie and display its poster and name
    movies.forEach(movie => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie");
        movieElement.id=movie.imdbID
        movieElement.style.display="flex"
        const cont = document.createElement("div");
        cont.style.marginLeft="5%"
        const poster = movie.Poster !== "N/A" ? movie.Poster : "./AltImage.jpeg";
        const posterImg = document.createElement("img");
        posterImg.src = poster;
        posterImg.height="300"
        posterImg.width="300"
        posterImg.style.marginTop="10px"
        cont.appendChild(posterImg);

        const title = movie.Title;
        const titleElem = document.createElement("h2");
        titleElem.textContent = title;
        cont.appendChild(titleElem);
        movieElement.appendChild(cont)
        // Add a click event listener to display movie details
        cont.addEventListener("click", () => {
            displayMovieDetails(movie.imdbID);
        });

        movieListContainer.appendChild(movieElement);
    });
}

function saveReview(event){
    let movieElement = document.getElementById(event.target.name);
    let comment = movieElement.getElementsByTagName("textarea")[0].value;
    let rating = parseInt(movieElement.getElementsByTagName("select")[0].value)
    reviews[event.target.name] = {rating, comment}
    localStorage.setItem("movieReviews", JSON.stringify(reviews));
}

// Function to display movie details
async function displayMovieDetails(imdbID) {
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`;
    
    try {
        const movieElement = document.getElementById(imdbID)
        let tempCheck = movieElement.getElementsByClassName("reviewContainer")
        if(tempCheck.length) {
            movieElement.removeChild(tempCheck[0])
            return;
        }
        const response = await fetch(url);
        const data = await response.json();
        const reviewContainer = document.createElement("div");
        reviewContainer.classList.add("reviewContainer");
        let comment="", rating=0;
        if(reviews[imdbID]){
            comment = reviews[imdbID].comment;
        rating=reviews[imdbID].rating;
        }
        
        if(reviewContainer.innerHTML){ reviewContainer.innerHTML = ""; return; }
        reviewContainer.innerHTML = `
            <div style="">
            <h2>${data.Title}</h2>
            <p>Year: ${data.Year}</p>
            <p>Plot: ${data.Plot}</p>
            <div>
            
            <select>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            </select>
            <span>&#9733; out of 5 </span>
            <textarea rows="4" cols="20" placeholder="Add your movie review">${comment}</textarea>
            <button name=${imdbID} onclick="saveReview(event)" >Save Reviews</button>
            </div>
            </div>
            <!-- Add other relevant details here -->
        `;
        movieElement.appendChild(reviewContainer)
        let ratingElement = reviewContainer.getElementsByTagName("select")[0];
        ratingElement.selectedIndex = rating;
    } catch (error) {
        console.error("Error fetching movie details:", error);
    }
}

// Function to handle pagination
function setupPagination(totalResults, currentPage) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(totalResults / 10);

    if (totalPages <= 1) {
        return; // No need for pagination if there is only one page
    }

    // Add Previous button if not on the first page
    if (currentPage > 1) {
        const prevButton = document.createElement("button");
        prevButton.textContent = "Previous";
        prevButton.addEventListener("click", () => {
            displayPage(currentPage - 1);
        });
        paginationContainer.appendChild(prevButton);
    }

    // Add page numbers
    for (let page = 1; page <= totalPages; page++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = page;
        pageButton.addEventListener("click", () => {
            displayPage(page);
        });
        paginationContainer.appendChild(pageButton);
    }

    // Add Next button if not on the last page
    if (currentPage < totalPages) {
        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.addEventListener("click", () => {
            displayPage(currentPage + 1);
        });
        paginationContainer.appendChild(nextButton);
    }
}

// Function to fetch and display movies for a specific page
async function displayPage(page) {
    const searchQuery = document.getElementById("searchInput").value;
    const data = await fetchMovies(searchQuery, page);

    if (data) {
        console.log(data)
        displayMovies(data.Search);
        setupPagination(data.totalResults, page);
    }
}

// Initial setup to fetch movies and display the first page
displayPage(1);

// Add event listener for search input to fetch and display movies on typing
const searchClick = document.getElementById("search");
document.getElementById("searchInput").addEventListener("change", ()=>{
    displayPage(1);
})
searchClick.addEventListener("click", () => {
    displayPage(1); // Reset pagination and fetch the first page of search results
});
