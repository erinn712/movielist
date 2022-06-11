const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = [] //電影總清單
let filteredMovies = [] //搜尋清單

const MOVIES_PER_PAGE = 12
let currentPage = 1 // 宣告currentPage紀錄目前分頁，確保切換模式時分頁不會跑掉且搜尋時不會顯示錯誤

let modeDisplaying = 'card-mode'//!NEW!宣告預設的renderMovieList模式

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const changeModeSwitch = document.querySelector('#change-mode-switch')


function renderMovieList(data) {
  if (modeDisplaying === 'card-mode') {
    let rawHTML = ''
    data.forEach((item) => {
      rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" 
            data-toggle="modal" 
            data-target="#movie-modal" 
            data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" 
            data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
    })
    dataPanel.innerHTML = rawHTML
  } else if (modeDisplaying === 'list-mode') {
    let rawHTML = `<ul class="list-group-flush col-sm-12 mb-2">`
    data.forEach((item) => {
      rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.title}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" 
            data-toggle="modal" 
            data-target="#movie-modal"
            data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" 
            data-id="${item.id}">+</button>
        </div>
      </li>`
    })
    rawHTML += '</ul>'
    dataPanel.innerHTML = rawHTML
  }
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item">
        <a class="page-link" href="#" data-page="${page}">
          ${page}
        </a>
      </li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  // get elements
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // send request to show api
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results

    // insert data into modal 
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release Date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if (list.some(movie => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//!NEW! eventlistener on switching mode & change modeDisplaying 
changeModeSwitch.addEventListener('click', function onSwitchClicked(event) {
  const displayMode = event.target.dataset.display
  modeDisplaying = displayMode

  renderMovieList(getMoviesByPage(currentPage))
})

// eventlistener on data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//eventlistener on search form
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  currentPage = 1
  renderPaginator(filteredMovies.length)
  //show paginator fits search result
  renderMovieList(getMoviesByPage(currentPage))
  //render page by search result & define current page = 1
})

// eventlistener on paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)

  currentPage = page

  renderMovieList(getMoviesByPage(currentPage))
})

// send request to index api
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage))
  })
  .catch(err => console.log(err))