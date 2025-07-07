import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Theme and color variables based on the provided requirements
const THEME_COLORS = {
  accent: "#ffca28",
  primary: "#1976d2",
  secondary: "#424242",
  bg: "#fff",
  sidebarBg: "#f8f9fa",
  text: "#282c34",
  shadow: "0 2px 8px rgba(0,0,0,0.06)",
  border: "#e9ecef",
  noteCardBg: "#fff",
  placeholder: "#919191"
};

// Generates a simple unique id for notes
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

// PUBLIC_INTERFACE
function App() {
  const [notes, setNotes] = useState(() => {
    // Try load from localstorage
    const saved = window.localStorage.getItem("notes-v1");
    if (saved) return JSON.parse(saved);
    // Default initial note
    return [
      {
        id: generateId(),
        title: "Welcome Note",
        content: "Select a note or create a new one to get started.",
        lastEdited: new Date().toISOString()
      }
    ];
  });

  const [selectedId, setSelectedId] = useState(notes.length ? notes[0].id : null);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editBuffer, setEditBuffer] = useState({ title: "", content: "", id: null });
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 720);

  // Save notes to localStorage for persistence
  useEffect(() => {
    window.localStorage.setItem("notes-v1", JSON.stringify(notes));
  }, [notes]);

  // Responsive sidebar
  useEffect(() => {
    function onResize() {
      setShowSidebar(window.innerWidth > 720);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Find the selected note for editing/viewing
  const selectedNote = notes.find((n) => n.id === selectedId);

  // Filtered notes based on search
  const filteredNotes = search
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.content.toLowerCase().includes(search.toLowerCase())
      )
    : notes;

  // Handler: Selecting a note
  const handleSelectNote = (id) => {
    setSelectedId(id);
    setIsCreating(false);
    setEditBuffer({ title: "", content: "", id: null });
  };

  // Handler: Create new note (shows editor with empty fields)
  const handleCreate = () => {
    setEditBuffer({ title: "", content: "", id: null });
    setIsCreating(true);
    setSelectedId(null);
  };

  // Handler: Edit an existing note (prefill fields)
  const handleEdit = () => {
    if (selectedNote) {
      setEditBuffer({
        title: selectedNote.title,
        content: selectedNote.content,
        id: selectedNote.id
      });
      setIsCreating(false);
    }
  };

  // Handler: Save new or edited note
  // PUBLIC_INTERFACE
  const handleSave = () => {
    // Validation: Require at least a title
    if (!editBuffer.title.trim()) {
      alert("Title is required!");
      return;
    }
    if (editBuffer.id) {
      // Editing existing note
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editBuffer.id
            ? { ...n, title: editBuffer.title, content: editBuffer.content, lastEdited: new Date().toISOString() }
            : n
        )
      );
      setSelectedId(editBuffer.id);
    } else {
      // Creating new note
      const newId = generateId();
      setNotes((prev) => [
        {
          id: newId,
          title: editBuffer.title,
          content: editBuffer.content,
          lastEdited: new Date().toISOString()
        },
        ...prev
      ]);
      setSelectedId(newId);
    }
    setEditBuffer({ title: "", content: "", id: null });
    setIsCreating(false);
  };

  // Handler: Delete note
  // PUBLIC_INTERFACE
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) {
      // Select next note or clear selection
      const idx = notes.findIndex((n) => n.id === id);
      const next = notes[(idx + 1) % notes.length];
      setSelectedId(next ? next.id : null);
    }
  };

  // Handler: Begin editing selected note
  const handleBeginEdit = () => {
    if (selectedNote) {
      setEditBuffer({
        title: selectedNote.title,
        content: selectedNote.content,
        id: selectedNote.id
      });
      setIsCreating(false);
    }
  };

  // Handler: Cancel edit/creation
  const handleCancelEdit = () => {
    setEditBuffer({ title: "", content: "", id: null });
    setIsCreating(false);
    if (!selectedId && notes.length > 0) setSelectedId(notes[0].id);
  };

  // Handler: Begin editing a note from list directly
  const handleQuickEdit = (id) => {
    const note = notes.find((n) => n.id === id);
    setEditBuffer({ title: note.title, content: note.content, id: note.id });
    setSelectedId(id);
    setIsCreating(false);
  };

  // Handler: Keyboard shortcuts for save/cancel in editor
  const editorRef = useRef();
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        if (editBuffer.title) {
          handleSave();
          e.preventDefault();
        }
      }
      if (e.key === "Escape") {
        handleCancelEdit();
        e.preventDefault();
      }
    }
    if (editBuffer.id || isCreating) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  });

  // PUBLIC_INTERFACE
  return (
    <div
      className="notes-app"
      style={{
        fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif",
        minHeight: "100vh",
        background: THEME_COLORS.bg,
        color: THEME_COLORS.text,
        display: "flex"
      }}
    >
      {/* SIDEBAR */}
      {showSidebar && (
        <aside
          className="sidebar"
          style={{
            width: 270,
            minWidth: 230,
            maxWidth: 350,
            background: THEME_COLORS.sidebarBg,
            borderRight: `1px solid ${THEME_COLORS.border}`,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            position: "sticky",
            top: 0,
            zIndex: 30,
            boxShadow: THEME_COLORS.shadow
          }}
        >
          <div style={{ padding: "24px 18px 10px 18px", borderBottom: `1px solid ${THEME_COLORS.border}` }}>
            <span
              style={{
                color: THEME_COLORS.primary,
                fontWeight: "bold",
                letterSpacing: "0.04em",
                fontSize: "1.4rem"
              }}
            >
              Notemaster
            </span>
            <button
              onClick={handleCreate}
              style={{
                float: "right",
                background: THEME_COLORS.accent,
                color: "#222",
                border: "none",
                borderRadius: 8,
                padding: "7px 18px",
                marginLeft: 10,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
              }}
              aria-label="Create new note"
            >
              + New
            </button>
          </div>

          <div style={{ padding: "13px 18px 10px 18px" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              style={{
                width: "100%",
                padding: "7px 13px",
                border: `1px solid ${THEME_COLORS.border}`,
                borderRadius: 6,
                fontSize: 15,
                background: "#fff",
                color: THEME_COLORS.text,
                marginBottom: 5,
                fontFamily: "inherit"
              }}
              aria-label="Search notes"
              spellCheck={false}
            />
          </div>

          {/* Notes list */}
          <nav style={{ flex: "1 1 0", overflowY: "auto", padding: "0 0 6px 0" }}>
            {filteredNotes.length === 0 ? (
              <div style={{ color: THEME_COLORS.placeholder, padding: "18px", textAlign: "center" }}>
                No notes found.
              </div>
            ) : (
              filteredNotes.map((n) => (
                <div
                  key={n.id}
                  className="note-list-item"
                  style={{
                    padding: "13px 18px",
                    background: n.id === selectedId ? THEME_COLORS.accent : "transparent",
                    color: n.id === selectedId ? "#111" : THEME_COLORS.secondary,
                    fontWeight: n.id === selectedId ? "bold" : 500,
                    borderRadius: 8,
                    margin: "3px 10px",
                    marginRight: 15,
                    cursor: "pointer",
                    boxShadow: n.id === selectedId ? THEME_COLORS.shadow : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                  onClick={() => handleSelectNote(n.id)}
                  aria-current={n.id === selectedId}
                  tabIndex={0}
                  onKeyPress={(e) => { if(e.key === "Enter") handleSelectNote(n.id);}}
                >
                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      fontSize: "1rem"
                    }}
                    title={n.title}
                  >
                    {n.title}
                  </span>
                  <div style={{ marginLeft: 8, display: "flex", gap: 2 }}>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: THEME_COLORS.secondary,
                        fontSize: 13,
                        marginLeft: 3,
                        cursor: "pointer"
                      }}
                      title="Quick Edit"
                      aria-label="Quick edit note"
                      onClick={e => { e.stopPropagation(); handleQuickEdit(n.id);}}
                    >✏️</button>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: "#c00",
                        fontSize: 13,
                        marginLeft: 2,
                        cursor: "pointer"
                      }}
                      title="Delete"
                      aria-label="Delete note"
                      onClick={e => { e.stopPropagation(); handleDelete(n.id);}}
                    >🗑️</button>
                  </div>
                </div>
              ))
            )}
          </nav>
          <footer style={{ padding: "11px 19px", fontSize: 13, color: THEME_COLORS.placeholder, borderTop: `1px solid ${THEME_COLORS.border}` }}>
            <span>Made with <span style={{ color: THEME_COLORS.primary }}>React</span></span>
          </footer>
        </aside>
      )}

      {/* MAIN PANEL */}
      <main
        className="main-panel"
        style={{
          flex: "1 1 0",
          background: "#f5f7fa",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column"
        }}
      >

        {/* Header/top bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "18px 24px",
          background: "#fff",
          borderBottom: `1px solid ${THEME_COLORS.border}`,
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
        }}>
          {!showSidebar && (
            <button
              style={{
                fontSize: 21,
                background: "none",
                border: "none",
                cursor: "pointer",
                marginRight: 8
              }}
              title="Show Sidebar"
              onClick={() => setShowSidebar(prev => !prev)}
            >
              ☰
            </button>
          )}

          {selectedNote && !editBuffer.id && !isCreating && (
            <>
              <h2 style={{
                fontWeight: 700,
                fontSize: "1.3rem",
                color: THEME_COLORS.primary,
                margin: 0,
                whiteSpace: "nowrap",
                maxWidth: "70vw",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {selectedNote.title}
              </h2>
              <button
                style={{
                  background: THEME_COLORS.accent,
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 15px",
                  color: "#222",
                  fontWeight: 700,
                  fontSize: 13,
                  marginLeft: 16,
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
                }}
                onClick={handleBeginEdit}
                aria-label="Edit note"
              >
                ✏️ Edit
              </button>
              <button
                style={{
                  background: "none",
                  border: `1px solid #c00`,
                  borderRadius: 16,
                  padding: "6px 14px",
                  color: "#c00",
                  fontWeight: 600,
                  marginLeft: 6,
                  cursor: "pointer",
                  fontSize: 13
                }}
                onClick={() => handleDelete(selectedNote.id)}
                aria-label="Delete note"
              >
                🗑️ Delete
              </button>
            </>
          )}

          {(editBuffer.id || isCreating) && (
            <>
              <span style={{
                fontWeight: 700,
                fontSize: "1.2rem",
                color: THEME_COLORS.secondary,
                marginRight: 15
              }}>
                {isCreating ? "Create Note" : "Edit Note"}
              </span>
            </>
          )}

        </div>

        {/* Central content area */}
        <div style={{
          flex: "1 1 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-center",
          justifyContent: "flex-start",
          minHeight: 0
        }}>
          {/* Editor form */}
          {(isCreating || editBuffer.id) && (
            <section style={{
              maxWidth: 650,
              width: "94%",
              margin: "30px auto 0 auto",
              background: THEME_COLORS.noteCardBg,
              boxShadow: "0 3px 16px rgba(0,0,0,0.04)",
              borderRadius: 12,
              padding: "30px 30px 20px 30px",
              border: `1px solid ${THEME_COLORS.border}`,
              display: "flex",
              flexDirection: "column",
              gap: 13
            }}>
              <input
                ref={editorRef}
                type="text"
                maxLength={90}
                placeholder="Title"
                value={editBuffer.title}
                autoFocus
                spellCheck={false}
                onChange={(e) =>
                  setEditBuffer((buf) => ({ ...buf, title: e.target.value }))
                }
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  width: "100%",
                  marginBottom: 8,
                  borderRadius: 7,
                  padding: "8px 12px",
                  border: `1px solid ${THEME_COLORS.primary}`,
                  background: "#fafbfc",
                  color: THEME_COLORS.text,
                  outline: "none"
                }}
              />
              <textarea
                placeholder="Type your note here..."
                rows={8}
                spellCheck={true}
                value={editBuffer.content}
                onChange={(e) =>
                  setEditBuffer((buf) => ({ ...buf, content: e.target.value }))
                }
                style={{
                  fontSize: 16,
                  borderRadius: 7,
                  padding: "13px 12px",
                  border: `1px solid ${THEME_COLORS.border}`,
                  background: "#fafbfc",
                  color: THEME_COLORS.text,
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
                aria-label="Note content"
              />

              <div style={{ display: "flex", gap: 15, marginTop: 4 }}>
                <button
                  onClick={handleSave}
                  style={{
                    background: THEME_COLORS.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 30px",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: THEME_COLORS.shadow
                  }}
                  aria-label="Save note"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    background: "none",
                    border: `1px solid ${THEME_COLORS.secondary}`,
                    borderRadius: 20,
                    padding: "8px 20px",
                    color: THEME_COLORS.secondary,
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: "pointer"
                  }}
                  aria-label="Cancel"
                >
                  Cancel
                </button>
              </div>
            </section>
          )}

          {/* Main note viewing display */}
          {!isCreating && !editBuffer.id && selectedNote && (
            <section style={{
              maxWidth: 720,
              width: "94%",
              margin: "35px auto 0 auto",
              background: THEME_COLORS.noteCardBg,
              boxShadow: "0 3px 10px rgba(0,0,0,0.03)",
              borderRadius: 12,
              padding: "40px 38px 30px 38px",
              border: `1px solid ${THEME_COLORS.border}`
            }}>
              <h2 style={{
                fontWeight: 800,
                fontSize: "2.0rem",
                margin: 0,
                color: THEME_COLORS.primary,
                marginBottom: 12,
                letterSpacing: "-0.5px"
              }}>
                {selectedNote.title}
              </h2>
              <div style={{
                fontSize: 15,
                color: THEME_COLORS.secondary,
                marginBottom: 18
              }}>
                Last edited:{" "}
                {new Date(selectedNote.lastEdited).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short"
                })}
              </div>
              <div style={{
                fontSize: 17,
                color: THEME_COLORS.text,
                whiteSpace: "pre-wrap",
                lineHeight: 1.51,
                minHeight: 80
              }}>
                {selectedNote.content || <span style={{ color: THEME_COLORS.placeholder }}>No content.</span>}
              </div>
            </section>
          )}

          {/* No note selected (empty state) */}
          {!isCreating && !editBuffer.id && !selectedNote && (
            <div style={{
              margin: "50px auto",
              textAlign: "center",
              color: THEME_COLORS.placeholder,
              fontSize: 19,
              letterSpacing: "0.06em"
            }}>
              No note selected.
              <div>
                <button
                  style={{
                    background: THEME_COLORS.accent,
                    color: "#222",
                    fontWeight: 700,
                    padding: "7px 22px",
                    border: "none",
                    borderRadius: 8,
                    marginTop: 13,
                    cursor: "pointer",
                    fontSize: 15
                  }}
                  onClick={handleCreate}
                >
                  + Create your first note
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
