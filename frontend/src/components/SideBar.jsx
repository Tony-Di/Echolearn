import { useState, useRef } from "react";
import { useMutation, useQuery } from 'react-query';
import { Link, useParams } from "react-router-dom";
import "./SideBar.css";

function SidebarContent({ isOpen, sidebarRef }) {
  const [folderCreated, setFolderCreated] = useState(false);
  const [openFolderIds, setOpenFolderIds] = useState([]);

  // Fetch sidebar info
  const { data: sidebarData, isLoading, error } = useQuery({
    queryFn: () =>
      fetch(`http://127.0.0.1:8000/api/sidebar`).then((response) =>
        response.json()
      ),
    onSuccess: () => {
      setFolderCreated(true)
    },
    onError: () => {
      console.log('An error occurred fetching sidebar')
    }
  });

  const createDefaultFolder = () => {
    setFolderCreated(true)
  };

  const openFolder = (folderId) => {
    if(openFolderIds.includes(folderId)) {
      setOpenFolderIds(openFolderIds.filter(id => id !== folderId));
    }else {
      setOpenFolderIds(openFolderIds.concat(folderId));
    }
  }

  // This will need be modify it with how the json (data) will be look like
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`} ref={sidebarRef}>
      {!folderCreated ? (
        <button onClick={createDefaultFolder}>Create</button>
      ) : (
        <div className="Folders">
          
          <ul>
            {sidebarData.Folders.map(folder => (
              <li key={folder.folder_id} onClick={() => openFolder(folder.folder_id)}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img src={openFolderIds.includes(folder.folder_id) ? "../folder_Open.png" : "../folder_Close.png"} 
                    style={{ width: openFolderIds.includes(folder.folder_id) ? "15%" : "10%", marginRight:"5px"}}/>
                  <span>{folder.name}</span>
                </div>
                {openFolderIds.includes(folder.folder_id) && (
                <ul>
                  {folder.decks.map(deck => (
                    <li key={deck.deck_id}>
                      {/* it should work after we got the deck page done */}
                        <Link to={`/decks/${deck.deck_id}`} style={{ display: "flex", alignItems: "center"  }}>
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
      )}
    </div>
  );
}

function SidebarButton({ isOpen, toggleSidebar, sidebarRef }) {
  const sidebarRect = isOpen ? sidebarRef.current.getBoundingClientRect() : null;
  const buttonPosition = isOpen ? sidebarRect.width - 20 : 0;

  const buttonStyle = {
    left: buttonPosition + "px",
    transform: "rotate(270deg)",
    transition: "right 0.5s ease-in-out",
  };

  return (
    <button className="sidebarButton" style={buttonStyle} onClick={toggleSidebar}>
      {isOpen ? "Close" : "Open"}
    </button>
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
