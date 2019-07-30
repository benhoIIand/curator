const saveList = (type, data) => fetch(`/save/${type}`, {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json'
  }
});

const addNewItem = (type, data) => fetch(`/add/${type}`, {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json'
  }
})

const TRAILING_SLASH_REGEX = new RegExp('\/$');

document.addEventListener('DOMContentLoaded', () => {
  const $movieList = document.querySelector('#movies');
  const $tvList = document.querySelector('#tv');
  const $saveMovies = $movieList.querySelector('#save_movies');
  const $saveTv = $tvList.querySelector('#save_tv');
  const $addMovie = $movieList.querySelector('#add_movie');
  const $addTv = $tvList.querySelector('#add_tv');
  const $moviesLoader = $movieList.querySelector('.loader');
  const $tvLoader = $tvList.querySelector('.loader');
  const $addTvField = $tvList.querySelectorAll('.add-field')[0];
  const $addMovieField = $movieList.querySelectorAll('.add-field')[0];

  const addTv = event => {
    console.log(event.keyCode);
    if (event.keyCode !== undefined && event.keyCode !== 13) {
      return;
    }

    let title = $addTvField.value;

    if (!TRAILING_SLASH_REGEX.test(title)) {
      title += '/';
    }

    $tvLoader.style.display = 'block';

    addNewItem('tv', [{
      title,
      selected: false,
    }]).then(() => {
      $tvLoader.style.display = 'none';
      window.location.reload();
    });
  };

  const addMovie = event => {
    console.log(event.keyCode);
    if (event.keyCode !== undefined && event.keyCode !== 13) {
      return;
    }

    let title = $addMovieField.value;

    if (!TRAILING_SLASH_REGEX.test(title)) {
      title += '/';
    }

    $moviesLoader.style.display = 'block';

    addNewItem('movies', [{
      title,
      selected: false,
    }]).then(() => {
      $moviesLoader.style.display = 'none';
      window.location.reload();
    });
  };

  $addMovie.addEventListener('click', addMovie);
  $addMovieField.addEventListener('keyup', addMovie);
  $addTv.addEventListener('click', addTv);
  $addTvField.addEventListener('keyup', addTv);

  $saveMovies.addEventListener('click', event => {
    const $movies = $movieList.querySelectorAll('.checkbox');
    const data = [...$movies].map(o => ({
      title: o.getAttribute('data-title'),
      selected: o.checked,
    }));

    $moviesLoader.style.display = 'block';

    saveList('movies', data).then(() => {
      $moviesLoader.style.display = 'none';
    });
  });

  $saveTv.addEventListener('click', event => {
    const $tv = $tvList.querySelectorAll('.checkbox');
    const data = [...$tv].map(o => ({
      title: o.getAttribute('data-title'),
      selected: o.checked,
    }));

    $tvLoader.style.display = 'block';

    saveList('tv', data)
      .then(() => {
        $tvLoader.style.display = 'none';
      })
      .catch(err => {
        alert(`Failed: ${err}`);
      });
  });
});
