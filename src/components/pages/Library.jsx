import { useEffect, useState } from "react";
import { 
  getBooks, 
  createBook, 
  updateBook, 
  deleteBook,
  getBooksBySubject,
  getBooksByType
} from "../services/libraryService";
import DownloadButton from "../DownloadButton";

export default function Library() {
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterType, setFilterType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  const [form, setForm] = useState({
    title: "",
    subject: "MATHEMATICS",
    bookType: "NON_CBC",
    quantity: 1,
    damagedCopies: 0,
    lostCopies: 0,
    condition: "Good",
    location: "Library",
    shelfNumber: "",
    author: "",
    publisher: "",
    publicationYear: new Date().getFullYear(),
    isbn: "",
    edition: "",
    dateAcquired: new Date().toISOString().split('T')[0],
    unitPrice: 0,
    notes: "",
  });

  const subjects = [
    "MATHEMATICS", "PHYSICS", "CHEMISTRY", "BIOLOGY", "ENGLISH",
    "HISTORY", "GEOGRAPHY", "ECONOMICS", "COMPUTER SCIENCE",
    "ENTREPRENEURSHIP", "KINYARWANDA", "KISWAHILI", "FRENCH",
    "RELIGION", "GENERAL STUDIES", "ICT", "LITERATURE"
  ];

  const bookTypes = [
    { value: "NON_CBC", label: "Non-CBC", color: "bg-blue-100 text-blue-700" },
    { value: "CBC", label: "CBC", color: "bg-emerald-100 text-emerald-700" },
    { value: "TEACHER_GUIDE", label: "Teacher's Guide", color: "bg-purple-100 text-purple-700" },
    { value: "PUPIL_BOOK", label: "Pupil's Book", color: "bg-amber-100 text-amber-700" },
    { value: "SCRIPTED_LESSONS", label: "Scripted Lessons", color: "bg-orange-100 text-orange-700" },
    { value: "EXPERIMENTAL_GUIDE", label: "Experimental Guide", color: "bg-indigo-100 text-indigo-700" },
  ];

  const conditions = ["New", "Good", "Fair", "Poor", "Damaged", "Needs Repair"];
  const locations = ["Library", "Store Room", "Classroom Set", "Reference Section", "Archive"];

  const fetchData = async () => {
    setLoading(true);
    try {
      let booksRes;
      if (filterSubject) {
        booksRes = await getBooksBySubject(filterSubject);
      } else if (filterType) {
        booksRes = await getBooksByType(filterType);
      } else {
        booksRes = await getBooks();
      }
      
      let booksData = booksRes.data || [];
      
      // Apply search filter
      if (searchTerm) {
        booksData = booksData.filter(book => 
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.isbn?.includes(searchTerm)
        );
      }
      
      setBooks(booksData);
      setError("");
    } catch (error) {
      console.error("Error fetching books:", error);
      setError("Failed to load library books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterSubject, filterType, searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSubject, filterType, searchTerm]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = books.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(books.length / itemsPerPage);

  const resetForm = () => {
    setForm({
      title: "",
      subject: "MATHEMATICS",
      bookType: "NON_CBC",
      quantity: 1,
      damagedCopies: 0,
      lostCopies: 0,
      condition: "Good",
      location: "Library",
      shelfNumber: "",
      author: "",
      publisher: "",
      publicationYear: new Date().getFullYear(),
      isbn: "",
      edition: "",
      dateAcquired: new Date().toISOString().split('T')[0],
      unitPrice: 0,
      notes: "",
    });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const resetFilters = () => {
    setFilterSubject("");
    setFilterType("");
    setSearchTerm("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      setError("Book title is required");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      if (editingId) {
        await updateBook(editingId, form);
        setSuccess("Book updated successfully!");
      } else {
        await createBook(form);
        setSuccess("Book added successfully!");
      }
      resetForm();
      setShowForm(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving book:", error);
      setError(error.response?.data?.message || "Failed to save book");
      setLoading(false);
    }
  };

  const handleEdit = (book) => {
    setForm({
      title: book.title,
      subject: book.subject || "MATHEMATICS",
      bookType: book.bookType || "NON_CBC",
      quantity: book.quantity || 1,
      damagedCopies: book.damagedCopies || 0,
      lostCopies: book.lostCopies || 0,
      condition: book.condition || "Good",
      location: book.location || "Library",
      shelfNumber: book.shelfNumber || "",
      author: book.author || "",
      publisher: book.publisher || "",
      publicationYear: book.publicationYear || new Date().getFullYear(),
      isbn: book.isbn || "",
      edition: book.edition || "",
      dateAcquired: book.dateAcquired ? new Date(book.dateAcquired).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      unitPrice: book.unitPrice || 0,
      notes: book.notes || "",
    });
    setEditingId(book._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      setLoading(true);
      try {
        await deleteBook(id);
        setSuccess("Book deleted successfully!");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Error deleting book:", error);
        setError("Failed to delete book");
        setLoading(false);
      }
    }
  };

  const getBookTypeStyle = (type) => {
    return bookTypes.find(t => t.value === type) || bookTypes[0];
  };

  const getConditionColor = (condition) => {
    const colors = {
      "New": "bg-blue-100 text-blue-700",
      "Good": "bg-emerald-100 text-emerald-700",
      "Fair": "bg-amber-100 text-amber-700",
      "Poor": "bg-orange-100 text-orange-700",
      "Damaged": "bg-rose-100 text-rose-700",
      "Needs Repair": "bg-purple-100 text-purple-700",
    };
    return colors[condition] || "bg-slate-100 text-slate-700";
  };

  const availableCopies = (book) => {
    return book.quantity - (book.damagedCopies || 0) - (book.lostCopies || 0);
  };

  // Get page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Summary statistics
  const totalBooks = books.reduce((sum, b) => sum + b.quantity, 0);
  const totalAvailable = books.reduce((sum, b) => sum + availableCopies(b), 0);
  const totalDamaged = books.reduce((sum, b) => sum + (b.damagedCopies || 0), 0);
  const totalLost = books.reduce((sum, b) => sum + (b.lostCopies || 0), 0);
  const uniqueTitles = books.length;

  // Prepare export data
  const exportData = books.map(book => ({
    title: book.title,
    author: book.author || "-",
    subject: book.subject || "-",
    type: book.bookType?.replace(/_/g, ' ') || "-",
    quantity: book.quantity || 0,
    available: availableCopies(book),
    damaged: book.damagedCopies || 0,
    lost: book.lostCopies || 0,
    condition: book.condition || "-",
    location: book.location || "-",
    shelfNumber: book.shelfNumber || "-",
    publisher: book.publisher || "-",
    isbn: book.isbn || "-",
    edition: book.edition || "-",
    publicationYear: book.publicationYear || "-",
    unitPrice: book.unitPrice ? `${book.unitPrice.toLocaleString()} RWF` : "-"
  }));

  const exportColumns = [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "subject", label: "Subject" },
    { key: "type", label: "Type" },
    { key: "quantity", label: "Total Copies" },
    { key: "available", label: "Available Copies" },
    { key: "damaged", label: "Damaged" },
    { key: "lost", label: "Lost" },
    { key: "condition", label: "Condition" },
    { key: "location", label: "Location" },
    { key: "shelfNumber", label: "Shelf Number" },
    { key: "publisher", label: "Publisher" },
    { key: "isbn", label: "ISBN" },
    { key: "edition", label: "Edition" },
    { key: "publicationYear", label: "Publication Year" },
    { key: "unitPrice", label: "Unit Price" }
  ];

  return (
    <div className="space-y-4">
      
      {/* Toast Messages */}
      {(success || error) && (
        <div className={`fixed top-20 right-4 z-50 animate-slide-in ${
          success ? "bg-emerald-500" : "bg-rose-500"
        } text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-sm`}>
          <span className="text-lg">{success ? "✓" : "⚠"}</span>
          <p className="font-medium">{success || error}</p>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-5 py-6 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
                Library Management
              </h1>
              <p className="text-slate-300 text-sm">
                Manage books, track inventory, and organize by subject
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="group bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold border border-white/20 hover:scale-105 shadow-lg text-sm"
            >
              <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
              Add New Book
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-slate-300 text-xs">Total Books</p>
              <p className="text-2xl md:text-3xl font-bold text-white mt-1">{totalBooks}</p>
              <p className="text-slate-400 text-xs mt-1">{uniqueTitles} titles</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-slate-300 text-xs">Available</p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-400 mt-1">{totalAvailable}</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-slate-300 text-xs">Borrowed</p>
              <p className="text-2xl md:text-3xl font-bold text-amber-400 mt-1">{totalBooks - totalAvailable}</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-slate-300 text-xs">Damaged</p>
              <p className="text-2xl md:text-3xl font-bold text-rose-400 mt-1">{totalDamaged}</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-slate-300 text-xs">Lost</p>
              <p className="text-2xl md:text-3xl font-bold text-purple-400 mt-1">{totalLost}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <input
              type="text"
              placeholder="Search by title, author, ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
          
          <select
            value={filterSubject}
            onChange={(e) => { setFilterSubject(e.target.value); setFilterType(""); }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setFilterSubject(""); }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
          >
            <option value="">All Types</option>
            {bookTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          
          <div>
            {(filterSubject || filterType || searchTerm) && (
              <button
                onClick={resetFilters}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Export Section */}
      {books.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Export Library Collection</h3>
            </div>
            <DownloadButton
              data={exportData}
              columns={exportColumns}
              title="School Inventory - Library Collection Report"
              filename="library_books_export"
              variant="primary"
            />
          </div>
        </div>
      )}

      {/* Results Count */}
      {books.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-3">
          <p className="text-xs text-slate-500">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, books.length)} of {books.length} books
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && !showForm && books.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-3 border-slate-200 rounded-full animate-spin border-t-indigo-500"></div>
        </div>
      ) : books.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-3 animate-float">📚</div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No books found</h3>
          <p className="text-slate-500 text-sm mb-4">Get started by adding your first book to the library</p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
          >
            Add Your First Book
          </button>
        </div>
      ) : (
        /* Books Table */
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Title</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Subject</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Total</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Available</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Condition</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((book, index) => {
                  const typeStyle = getBookTypeStyle(book.bookType);
                  const available = availableCopies(book);
                  const isLowStock = available < 3 && available > 0;
                  
                  return (
                    <tr key={book._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{book.title}</p>
                          {book.author && <p className="text-xs text-slate-400">{book.author}</p>}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-600 text-sm">
                        {book.subject}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-1.5 py-0.5 rounded-md text-xs font-medium ${typeStyle.color}`}>
                          {typeStyle.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right font-semibold text-slate-700">
                        {book.quantity}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <span className={`font-semibold text-sm ${available === 0 ? 'text-rose-500' : isLowStock ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {available}
                        </span>
                        {available === 0 && <span className="ml-1 text-xs text-rose-500">(Out)</span>}
                        {isLowStock && available > 0 && <span className="ml-1 text-xs text-amber-500">(Low)</span>}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-1.5 py-0.5 rounded-md text-xs font-medium ${getConditionColor(book.condition)}`}>
                          {book.condition}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div>
                          <p className="text-slate-600 text-sm">{book.location}</p>
                          {book.shelfNumber && <p className="text-xs text-slate-400">Shelf: {book.shelfNumber}</p>}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => handleEdit(book)} 
                            className="p-1 rounded hover:bg-indigo-50 text-indigo-600 text-sm transition-all"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(book._id)} 
                            className="p-1 rounded hover:bg-rose-50 text-rose-500 text-sm transition-all"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-3 py-2 border-t border-slate-200 bg-slate-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <div className="text-xs text-slate-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-2 py-1 rounded text-xs font-medium transition ${
                      currentPage === 1
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {getPageNumbers().map((page, idx) => (
                      <button
                        key={idx}
                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        className={`w-7 h-7 rounded text-xs font-medium transition ${
                          currentPage === page
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm"
                            : page === '...'
                            ? "text-slate-400 cursor-default"
                            : "bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                        disabled={page === '...'}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-2 py-1 rounded text-xs font-medium transition ${
                      currentPage === totalPages
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">{editingId ? "Edit" : "Add"}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-800">{editingId ? "Edit Book" : "Add New Book"}</h2>
              </div>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 text-xl flex items-center justify-center">
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Book Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                    placeholder="Enter book title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Book Type</label>
                  <select
                    value={form.bookType}
                    onChange={(e) => setForm({ ...form, bookType: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  >
                    {bookTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                    placeholder="Author name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Publisher</label>
                  <input
                    type="text"
                    value={form.publisher}
                    onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                    placeholder="Publisher name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={form.isbn}
                    onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                    placeholder="ISBN number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Edition</label>
                  <input
                    type="text"
                    value={form.edition}
                    onChange={(e) => setForm({ ...form, edition: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                    placeholder="Edition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Publication Year</label>
                  <input
                    type="number"
                    value={form.publicationYear}
                    onChange={(e) => setForm({ ...form, publicationYear: parseInt(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Quantity</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Damaged Copies</label>
                  <input
                    type="number"
                    value={form.damagedCopies}
                    onChange={(e) => setForm({ ...form, damagedCopies: parseInt(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lost Copies</label>
                  <input
                    type="number"
                    value={form.lostCopies}
                    onChange={(e) => setForm({ ...form, lostCopies: parseInt(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  >
                    {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <select
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  >
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shelf Number</label>
                  <input
                    type="text"
                    value={form.shelfNumber}
                    onChange={(e) => setForm({ ...form, shelfNumber: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                    placeholder="e.g., A-12, B-3"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Price (RWF)</label>
                  <input
                    type="number"
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: parseInt(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date Acquired</label>
                  <input
                    type="date"
                    value={form.dateAcquired}
                    onChange={(e) => setForm({ ...form, dateAcquired: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                    rows="2"
                    placeholder="Additional notes about this book..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm disabled:opacity-50"
                >
                  {loading ? "Saving..." : (editingId ? "Update Book" : "Add Book")}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}