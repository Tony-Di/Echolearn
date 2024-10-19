import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "react-query";
import { useState, useEffect } from "react";
import Sidebar from "../components/SideBar";
// import 'katex/dist/katex.min.css';
import { useApi } from "../hooks";
import { CurveArrowRight } from '../components/Icons';
import LoadingSpinner from "../components/LoadingSpinner";
import { HeartIcon } from "../components/Icons";

function CommunityPage() {
  const api = useApi();
  const [sidebarWidth, setSidebarWidth] = useState(250);

  const [searchQuery, setSearchQuery] = useState('');

  const { data: decks, isLoading, error, refetch } = useQuery({
    queryFn: () =>
      api._get(`/api/decks/AllPublicDecks`).then((response) => response.json()),
  });

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    const [status, message] = error.message.split(': ');

    return (
      <>
        <h1 className="mt-20 text-[3rem] font-bold">{status}</h1>
        <p className="mt-2 text-[1.5rem]">{message}</p>
      </>
    );
  }

  console.log(decks);

  let filteredDecks = [];
  if (decks) {
    filteredDecks = decks.filter(deck =>
      deck.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (decks) {
    return (
      <>
        <div className='flex w-full h-full'>
          <Sidebar onResize={(newWidth) => setSidebarWidth(newWidth)} sidebarWidth={sidebarWidth} setSidebarWidth={setSidebarWidth} />
          {/* <div className="flex flex-col items-center flex-grow"> */}
          <div className="w-full flex flex-col mx-[15%]">
            {decks && decks.length > 0 ? (
              <>
                <h1 className="text-[2rem] text-elDark dark:text-edWhite font-medium mt-8 mb-4 border-b border-elDividerGray dark:border-edDividerGray pb-1">Public Decks</h1>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by deck title..."
                  className="mb-4 p-2 rounded-md w-full focus:outline-none bg-elCloudWhite text-black dark:bg-edDarker dark:text-edWhite"
                />
                <div className="overflow-y-auto border-b-4 border-elDividerGray dark:border-edDividerGray max-h-[calc(100vh-16rem)] grid grid-cols-3 gap-4">
                  {filteredDecks.map(deck => (
                    <div key={deck.deck_id} className="h-[30vh] rounded-xl bg-elCloudWhite text-black dark:bg-edDarker 
                    dark:text-edWhite mt-2 p-3 relative border border-edDarker overflow-y-auto" style={{ minHeight: '100px' }}>
                      <h1 className="text-2xl font-medium text-black dark:text-edWhite">{deck.name}</h1>
                      <p className="text-base text-elDark dark:text-edGray"> by <Link to={`/profile/${deck.owner_id}`}
                        className="font-medium text-elBlue dark:text-edSoftBlue hover:underline">{deck.owner_username}</Link></p>

                      <div className="flex mt-2 items-center">
                        <HeartIcon isFilled={false} className="mr-1" />
                        <span>{deck.favorites}</span>
                      </div>

                      <h2 className="mt-2 font-medium">Description</h2>
                      <p className="text-elDark dark:text-edGray">{deck.description}</p>

                      <h2 className="mt-2 font-medium">Last Updated</h2>
                      <p className="text-elDark dark:text-edGray">{deck.last_edited}</p>

                      <Link to={`/decks/public/${deck.deck_id}`} className="absolute top-3 right-3">
                        <CurveArrowRight />
                      </Link>
                    </div>
                  ))}
                </div>

              </>
            ) : (
              <div>Loading...</div>
            )}

          </div>
        </div>
      </>
    )
  }
}


export default CommunityPage