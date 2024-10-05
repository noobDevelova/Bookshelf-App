/**
 * Adds an event listener that initializes the book shelf application when the DOM is fully loaded.
 */
window.addEventListener("DOMContentLoaded", () => {
  const booksShelf = []; // Array to store the list of books.
  const RENDER_BOOKS = "render-book-shelf"; // Event for rendering the book shelf.
  const SAVED_BOOKS = "saved-book-shelf"; // Event for saved books notification.
  const BOOKS_SHELF_KEY = "book-shelf"; // Key for local storage.
  const bookForm = document.getElementById("bookForm"); // Form element for adding/editing books.
  const searchBookForm = document.getElementById("searchBook"); // Form element for searching books.
  let editingBookID = null; // Holds the ID of the book being edited.

  /**
   * Checks if the browser supports local storage.
   * @returns {boolean} True if local storage is supported, otherwise false.
   */
  const isStorageExist = () => {
    if (typeof Storage === undefined) {
      alert("Browser tidak support local storage!");
      return false;
    }
    return true;
  };

  /**
   * Saves the current list of books to local storage.
   */
  const saveBook = () => {
    if (isStorageExist()) {
      const parsed = JSON.stringify(booksShelf);
      localStorage.setItem(BOOKS_SHELF_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_BOOKS));
    }
  };

  /**
   * Resets the book form to its initial state.
   */
  const resetForm = () => {
    bookForm.reset();
    document.getElementById("form-heading").innerText = "Tambah Buku Baru";
    document.getElementById("bookFormSubmit").innerText =
      "Masukkan Buku ke rak";
    editingBookID = null; // Reset editing book ID.
  };

  /**
   * Loads the data of a book into the form for editing.
   * @param {Object} book - The book object containing the book data.
   */
  const loadBookForm = (book) => {
    editingBookID = book.id;
    document.getElementById("bookFormTitle").value = book.title;
    document.getElementById("bookFormAuthor").value = book.author;
    document.getElementById("bookFormYear").value = book.year;
    document.getElementById("bookFormIsComplete").checked = book.isComplete
      ? true
      : false;

    document.getElementById("form-heading").innerText = "Edit Buku";
    document.getElementById("bookFormSubmit").innerText = "Perbarui Buku";
  };

  /**
   * Finds a book in the shelf by its ID.
   * @param {string} bookId - The ID of the book to find.
   * @returns {Object|null} The found book object or null if not found.
   */
  const findBook = (bookId) => {
    return booksShelf.filter((book) => book.id === bookId)[0];
  };

  /**
   * Finds the index of a book in the shelf by its ID.
   * @param {string} bookId - The ID of the book to find.
   * @returns {number} The index of the book or -1 if not found.
   */
  const findBookIndex = (bookId) => {
    return booksShelf.findIndex((book) => book.id === bookId);
  };

  /**
   * Updates a book's information in the shelf.
   * @param {string} bookId - The ID of the book to update.
   */
  const updateBook = (bookId) => {
    const bookItem = findBook(bookId);
    if (bookItem) {
      bookItem.title = document.getElementById("bookFormTitle").value;
      bookItem.author = document.getElementById("bookFormAuthor").value;
      bookItem.year = parseInt(document.getElementById("bookFormYear").value);
      bookItem.isComplete = document.getElementById("bookFormIsComplete")
        .checked
        ? true
        : false;

      resetForm();
      document.dispatchEvent(new Event(RENDER_BOOKS));
      saveBook();
    }
  };

  /**
   * Creates a book object with the given parameters.
   * @param {string} id - The ID of the book.
   * @param {string} title - The title of the book.
   * @param {string} author - The author of the book.
   * @param {number} year - The year the book was published.
   * @param {boolean} isComplete - Indicates if the book is completed.
   * @returns {Object} The created book object.
   */
  const createBookData = (id, title, author, year, isComplete) => {
    return {
      id,
      title,
      author,
      year,
      isComplete,
    };
  };

  /**
   * Generates a unique book ID.
   * @returns {string} The generated unique book ID.
   */
  const createBookID = () => {
    const timestamp = Date.now().toString(36);
    const randomNum = Math.random().toString(36).substring(2, 9);
    return `BS${timestamp}-${randomNum}`;
  };

  /**
   * Marks a book as unread.
   * @param {string} bookId - The ID of the book to undo.
   */
  const undoBookRead = (bookId) => {
    const bookItem = findBook(bookId);
    if (bookItem === null) return;
    bookItem.isComplete = false;
    document.dispatchEvent(new Event(RENDER_BOOKS));
    saveBook();
  };

  /**
   * Marks a book as read.
   * @param {string} bookId - The ID of the book to complete.
   */
  const completeBookRead = (bookId) => {
    const bookItem = findBook(bookId);
    if (bookItem === null) return;
    bookItem.isComplete = true;
    document.dispatchEvent(new Event(RENDER_BOOKS));
    saveBook();
  };

  /**
   * Deletes a book from the shelf.
   * @param {string} bookId - The ID of the book to delete.
   */
  const deleteBook = (bookId) => {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex === -1) return;
    booksShelf.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_BOOKS));
    saveBook();
  };

  /**
   * Searches for books by title.
   * @param {string} bookTitle - The title of the book to search for.
   * @returns {Array} An array of matching book objects.
   */
  const searchBook = (bookTitle) => {
    return booksShelf.filter(
      (book) => book.title.toLowerCase() === bookTitle.toLowerCase()
    );
  };

  /**
   * Creates a card element for a book.
   * @param {Object} book - The book object.
   * @returns {HTMLElement} The card element containing the book information.
   */
  const createBookCard = (book) => {
    const cardBookTitle = document.createElement("h3");
    cardBookTitle.innerText = book.title;
    cardBookTitle.classList.add("card-header");
    cardBookTitle.setAttribute("data-testid", "bookItemTitle");

    const cardBookAuthor = document.createElement("p");
    cardBookAuthor.innerText = `Penulis: ${book.author}`;
    cardBookAuthor.classList.add("card-sub-header");
    cardBookAuthor.setAttribute("data-testid", "bookItemAuthor");

    const cardBookYear = document.createElement("p");
    cardBookYear.innerText = `Tahun: ${book.year}`;
    cardBookYear.classList.add("card-sub-header");
    cardBookYear.setAttribute("data-testid", "bookItemYear");

    const cardAction = document.createElement("div");
    cardAction.classList.add("card-actions-wrapper");
    const bookItemCompleteBtn = document.createElement("button");
    bookItemCompleteBtn.classList.add("btn", "btn-secondary");
    bookItemCompleteBtn.setAttribute("data-testid", "bookItemIsCompleteButton");

    if (book.isComplete) {
      bookItemCompleteBtn.innerText = "Belum selesai dibaca";
      bookItemCompleteBtn.addEventListener("click", () => {
        undoBookRead(book.id);
      });

      cardAction.append(bookItemCompleteBtn);
    } else {
      bookItemCompleteBtn.innerText = "Selesai dibaca";
      bookItemCompleteBtn.addEventListener("click", () => {
        completeBookRead(book.id);
      });

      cardAction.append(bookItemCompleteBtn);
    }

    const bookItemDeleteBtn = document.createElement("button");
    const bookItemEditBtn = document.createElement("button");

    bookItemDeleteBtn.classList.add("btn", "btn-danger");
    bookItemEditBtn.classList.add("btn", "btn-warning");

    bookItemDeleteBtn.setAttribute("data-testid", "bookItemDeleteButton");
    bookItemEditBtn.setAttribute("data-testid", "bookItemEditButton");

    bookItemDeleteBtn.innerText = "Hapus Buku";
    bookItemEditBtn.innerText = "Edit Buku";

    bookItemDeleteBtn.addEventListener("click", () => {
      deleteBook(book.id);
    });
    bookItemEditBtn.addEventListener("click", () => {
      loadBookForm(book);
    });

    cardAction.append(bookItemDeleteBtn, bookItemEditBtn);

    const cardBook = document.createElement("div");
    cardBook.classList.add("card");
    cardBook.setAttribute("data-testid", "bookItem");

    cardBook.append(cardBookTitle, cardBookAuthor, cardBookYear, cardAction);

    return cardBook;
  };

  /**
   * Renders all books in the shelf to the UI.
   * @returns {void}
   */
  const renderBooks = () => {
    const uncompletedBooksList = document.getElementById("uncompletedBooks");
    const completedBooksList = document.getElementById("completedBooks");

    // Clear the lists before rendering.
    uncompletedBooksList.innerHTML = "";
    completedBooksList.innerHTML = "";

    for (const book of booksShelf) {
      const bookCard = createBookCard(book);
      if (!book.isComplete) {
        uncompletedBooksList.append(bookCard);
      } else {
        completedBooksList.append(bookCard);
      }
    }
  };

  // Event listener for form submission to add or update a book.
  bookForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (editingBookID) {
      updateBook(editingBookID);
    } else {
      const title = document.getElementById("bookFormTitle").value;
      const author = document.getElementById("bookFormAuthor").value;
      const year = parseInt(document.getElementById("bookFormYear").value);
      const isComplete = document.getElementById("bookFormIsComplete").checked;

      const newBook = createBookData(
        createBookID(),
        title,
        author,
        year,
        isComplete
      );
      booksShelf.push(newBook);
      saveBook();
      resetForm();
    }
    document.dispatchEvent(new Event(RENDER_BOOKS));
  });

  // Event listener for rendering books after saving.
  document.addEventListener(SAVED_BOOKS, () => {
    console.log("Buku berhasil disimpan.");
  });

  // Event listener for rendering books.
  document.addEventListener(RENDER_BOOKS, renderBooks);

  // Event listener for searching books.
  searchBookForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const searchValue = document.getElementById("searchInput").value;
    const result = searchBook(searchValue);
    const resultList = document.getElementById("searchResult");
    resultList.innerHTML = ""; // Clear previous results.

    result.forEach((book) => {
      const bookCard = createBookCard(book);
      resultList.append(bookCard);
    });
  });

  // Load books from local storage on page load.
  if (isStorageExist()) {
    const dataFromStorage = JSON.parse(localStorage.getItem(BOOKS_SHELF_KEY));
    if (dataFromStorage) {
      for (const book of dataFromStorage) {
        booksShelf.push(book);
      }
    }
    document.dispatchEvent(new Event(RENDER_BOOKS));
  }
});
