import { useState, useRef, useEffect } from "react";
import { useQuery } from 'react-query';
import { Link, useParams } from "react-router-dom";
import "./SideBar.css";

function SidebarContent({ isOpen, sidebarRef }) {
  const [folderCreated, setFolderCreated] = useState(false);
  const [openFolderIds, setOpenFolderIds] = useState([]);
  const [sidebarData, setSidebarData] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  // Fetch sidebar info when the sidebar is opened for the first time
  useEffect(() => {
    if (isOpen) {
      fetchSidebarData();
    }
    
  }, [isOpen]);
  
  useEffect(() => {
    const handleOutsideClick = (event) => {
      console.log("I am here");
      if (contextMenu && (!sidebarRef.current || !sidebarRef.current.contains(event.target))) {
        setContextMenu(null); // Close the context menu
      }
    };

    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setContextMenu(null); // Close on ESC key
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [contextMenu]);

  const fetchSidebarData = () => {
    fetch(`http://127.0.0.1:8000/api/sidebar`)
      .then((response) => response.json())
      .then((data) => {
        setSidebarData(data);
        setFolderCreated(true);
      })
      .catch((error) => {
        console.log('An error occurred fetching sidebar:', error);
      });
  };

  // TO-DO
  // need to update this that when user click the "create" button it will create the root folder to the database for the user
  const createDefaultFolder = () => {
    setFolderCreated(true);
  };

  const openFolder = (folderId) => {
    if (openFolderIds.includes(folderId)) {
      setOpenFolderIds(openFolderIds.filter(id => id !== folderId));
    } else {
      setOpenFolderIds(openFolderIds.concat(folderId));
    }
  };

  const handleContextMenu = (event, folderId) => {
    event.preventDefault();
    console.log("Page X/Y:", event.pageX, event.pageY);
    console.log("Client X/Y:", event.clientX, event.clientY);
    console.log("Offset X/Y:", event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    setContextMenu({
      x: event.nativeEvent.pageX ,
      y: event.nativeEvent.pageY,
      folderId: folderId
    });
  };
  
  if (!folderCreated) {
    return (
      <div className="sidebar" ref={sidebarRef}>
        <button onClick={createDefaultFolder}>Create</button>
      </div>
    );
  }

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`} ref={sidebarRef}>
      <div className="Folders">
        <ul>
          {sidebarData.Folders.map(folder => (
            <li key={folder.folder_id} onClick={() => openFolder(folder.folder_id)} onContextMenu={(e) => handleContextMenu(e, folder.folder_id)} className="mb-4">
              <div className="cursor-pointer" style={{ display: "flex", alignItems: "center" }}>
                <img src={openFolderIds.includes(folder.folder_id) ? "../folder_Open.png" : "../folder_Close.png"} 
                  style={{ width: openFolderIds.includes(folder.folder_id) ? "15%" : "12%", marginRight:"8px"}}/>
                <span>{folder.name}</span>
              </div>
              {openFolderIds.includes(folder.folder_id) && (
                <ul>
                  {folder.decks.map(deck => (
                    <li key={deck.deck_id}>
                      <Link to={`/decks/${deck.deck_id}`} style={{ display: "flex", alignItems: "center" }}>
                        <img src="../Decks.png" style={{ width: "25%" }} />
                        {deck.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)} folderId={contextMenu.folderId} />}
    </div>
  );
}


function SidebarButton({ isOpen, toggleSidebar, sidebarRef }) {
  return (
    <button className={`sidebarButton p-2 py-1 rounded-md bg-[#383838] ${isOpen ? "open" : ""}`} onClick={toggleSidebar}>
      {isOpen ? "←" : "→"}
    </button>
  );
}
function ContextMenu({ x, y, folderId }) {
  console.log(x,y)
  return (
    <ul className="context-menu" style={{ top: y, left: x, position: 'absolute', backgroundColor: 'black', border: '1px solid #ccc' }}>
      <li onClick={() => alert(`Rename folder ${folderId}`)} style={{ padding: '5px 15px', cursor: 'pointer' }}>Rename</li>
      <li onClick={() => alert(`Delete folder ${folderId}`)} style={{ padding: '5px 15px', cursor: 'pointer' }}>Delete</li>
    </ul>
  );
}

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <SidebarContent isOpen={isOpen} sidebarRef={sidebarRef} />
      <SidebarButton isOpen={isOpen} toggleSidebar={toggleSidebar} sidebarRef={sidebarRef} />
    </div>
  );
}

export default Sidebar;
