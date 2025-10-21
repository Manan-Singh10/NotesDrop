// Simple script to help you get note IDs for testing
// Run this in your browser console on the notes page

async function getNoteIds() {
  try {
    const response = await fetch('/api/notes');
    const notes = await response.json();
    
    console.log('Available Note IDs:');
    notes.forEach((note, index) => {
      console.log(`${index + 1}. ${note.title} - ID: ${note.id}`);
    });
    
    return notes;
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
}

// Run the function
getNoteIds();
