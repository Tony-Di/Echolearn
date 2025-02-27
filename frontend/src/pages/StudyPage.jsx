import { useState, useEffect, useContext, createContext } from "react";
import { useQuery } from 'react-query';
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useApi } from "../hooks";
import Sidebar from "../components/SideBar";
import partyPopperImg from '../assets/party-popper.png';
import partyPopperFlipImg from '../assets/party-popper-flip.png';
import LoadingSpinner from "../components/LoadingSpinner";
import MarkdownPreviewer from "../components/MarkdownPreviewer";
import { FlashCardIcon, QuestionSetIcon } from "../components/Icons";
import "./ReviewPage.css";
import './Buttons.css';

const ReviewContext = createContext();

const ReviewProvider = ({ children }) => {
  const api = useApi();

  const [showAnswer, setShowAnswer] = useState(false); // Reveals the answer buttons as well as the 'Answer' card on the default review display setting
  const [finish, setFinish] = useState(false);
  const [changeAnimation, setAnimation] = useState(true);

  const [searchParams] = useSearchParams();
  const studyAll = searchParams.get('studyAll') === 'true';
  const deckIds = searchParams.get('deckIds')?.split(',');
  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);

  const [flip, setFlip] = useState(false);

  // Whether to display the question or answer on the 'flip' version of the card
  // This is to make the animation seem smoother by switching the displayed text half way through the flip animation
  const [displayQuestionOnFlipCard, setDisplayQuestionOnFlipCard] = useState(true);

  // Fetch user settings
  const { data: userSettingsData, settingsIsLoading, settingsError } = useQuery(
    ['userSettings'],
    async () => {
      let response = await api._get('/api/profile/me');
      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.detail || 'An error occurred';
        throw new Error(`${response.status}: ${message}`);
      }
      return response.json(); // Ensure we return the response data
    },
    {
      onSuccess: (data) => {
        setAnimation(data?.flip_mode ?? true);  // Set flip after successful data fetch
      }
    }
  );

  // Fetch reviews info
  const { data: reviewsData, reviewsIsLoading, reviewsError } = useQuery(
    ['reviewsData', deckIds, studyAll],
    async () => {
      let response = await api._get(`/api/study?deckIds=${deckIds}&studyAll=${studyAll}`);

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.detail || 'An error occurred';
        throw new Error(`${response.status}: ${message}`);
      }

      return response.json()
    },
    {
      retry: false
    }
  );

  const toggleFlip = () => {
    setFlip((prevFlip) => {
      const newFlip = !prevFlip

      setShowAnswer(newFlip);
      setTimeout(() => {
        setDisplayQuestionOnFlipCard(!newFlip);
      }, 150);
      return newFlip; // Update flip state
    });
  }

  // Update card
  const updateReviewedCard = () => {
    toggleFlip();
  
    const finishDeck = () => {
      if (currentDeckIndex < reviewsData.decks.length - 1) {
        setCurrentDeckIndex((prev) => prev + 1);
        setCardIndex(0);
      } else {
        setFinish(true);
      }
    };
  
    const updateCardIndex = () => {
      if (cardIndex < reviewsData.decks[currentDeckIndex].cards.length - 1) {
        setCardIndex((prev) => prev + 1);
      } else {
        finishDeck();
      }
    };
  
    updateCardIndex();
  };

  return (
    <ReviewContext.Provider
      value={{
        updateReviewedCard,
        showAnswer, setShowAnswer,
        finish, setFinish,
        changeAnimation, setAnimation,
        studyAll,
        deckIds,
        currentDeckIndex, setCurrentDeckIndex,
        cardIndex, setCardIndex,
        flip, setFlip,
        displayQuestionOnFlipCard, setDisplayQuestionOnFlipCard, toggleFlip,
        userSettingsData, settingsIsLoading, settingsError,
        reviewsData, reviewsIsLoading, reviewsError,
        // reviewTimes, reviewTimeIsLoading, reviewTimeError
      }}>
      {children}
    </ReviewContext.Provider>
  );
}

function ReviewPage() {
  return (
    <ReviewProvider>
      <ReviewPageContent />
    </ReviewProvider>
  )
}

function ReviewPageContent() {
  const navigate = useNavigate();

  const [sidebarWidth, setSidebarWidth] = useState(250);

  const {
    setAnimation, changeAnimation,
    finish, cardIndex,
    settingsIsLoading, settingsError,
    reviewsData, reviewsIsLoading, reviewsError,
    currentDeckIndex, deckIds
  } = useContext(ReviewContext);

  if (settingsIsLoading || reviewsIsLoading) {
    return <LoadingSpinner />;
  }

  if (settingsError || reviewsError) {
    let error = "";

    if (settingsError) {
      error = settingsError;
    } else if (reviewsError) {
      error = reviewsError;
    }

    let [status, message] = error.message.split(': ');

    return (
      <>
        <h1 className="mt-20 text-[3rem] font-bold">{status}</h1>
        <p className="mt-2 text-[1.5rem]">{message}</p>
      </>
    );
  }

  // Check if reviews data is available
  if (!reviewsData || !reviewsData.decks || reviewsData.decks.length === 0) {
    return <div>No cards found for review.</div>;
  }

  return (
    <div className="flex w-full h-full">
      <Sidebar onResize={(newWidth) => setSidebarWidth(newWidth)} sidebarWidth={sidebarWidth} setSidebarWidth={setSidebarWidth} />
      <div className="rounded-lg mt-[2%] flex flex-col flex-grow min-w-[16rem] mx-auto overflow-x-auto">
        <div className="grid grid-cols-3 mx-auto items-center border-b border-elDividerGray dark:border-edDividerGray pb-2 w-[40vw]">
          <button type="button" onClick={() => { navigate(-1) }} className="py-2 w-[50%] text-center block rounded-lg border border-edGray 
            text-black dark:text-edWhite hover:bg-elHLT dark:hover:bg-edHLT">Back</button>
          <h2 className="text-center text-[2em] grid-col text-elDark dark:text-edWhite mx-auto">{reviewsData.decks[currentDeckIndex].deck_name}</h2>
          <div className="flex gap-4 justify-end items-center">
            {/* QuestionSetIcon Button */}
            <button className="border border-black" onClick={() => setAnimation(false)}>
              <QuestionSetIcon isTrue={changeAnimation} />
            </button>

            {/* FlashCardIcon Button */}
            <button className="border border-black" onClick={() => setAnimation(true)}>
              <FlashCardIcon isTrue={changeAnimation} />
            </button>
          </div>
        </div>
        {!finish && (
          <ReviewCard card={reviewsData.decks[currentDeckIndex].cards[cardIndex]} />
        )}
        {finish && <FinishView deckId={deckIds[currentDeckIndex]} />}
      </div>
    </div>
  );
}

function FinishView(deckId) {
  return (
    <div className="flex flex-row justify-center items-center mt-[10vh]">
      <img className="w-40 h-40 mt-[-10vh]" src={partyPopperFlipImg} alt="Party Popper" />
      <div className="flex flex-col justify-center items-center mx-4">
        <h3 className="h-[25vh] flex justify-center items-center w-full border border-black bg-white rounded-md p-5 text-2xl text-black my-4">You have studied all the cards in this deck</h3>
        <Link to={`/decks/public/${deckId.deckId}`}>
          <button className="button-common button-blue border rounded-md px-2 py-1">Back to deck</button>
        </Link>
      </div>
      <img className="w-40 h-40 mt-[-10vh]" src={partyPopperImg} alt="Party Popper" />
    </div>
  )
}

function ReviewCard({ card }) {
  const { changeAnimation, displayQuestionOnFlipCard, toggleFlip } = useContext(ReviewContext);

  const handleKeyDown = (e) => {
    if (e.key === ' ' && !e.repeat) {
      e.preventDefault(); // Prevent page scrolling
      toggleFlip(); // Trigger flip on spacebar press
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleFlip]);

  return (
    <>
      <div className="flex flex-col items-center">
        <div className={`flex flex-col items-center h-auto w-[35vw] min-w-[16rem] mx-auto`}>
          <div className="w-full">
            {!changeAnimation && (<QuestionCard card={card}></QuestionCard>)}
            {!changeAnimation && (<AnswerCard card={card} displayQuestion={displayQuestionOnFlipCard}></AnswerCard>)}
            {changeAnimation && (<FlipFlashcard card={card} displayQuestion={displayQuestionOnFlipCard}></FlipFlashcard>)}
          </div>
        </div>
      </div>
      <ShowAnswerButtons></ShowAnswerButtons>
    </>
  );
}

function QuestionCard({ card }) {
  const { showAnswer, setShowAnswer } = useContext(ReviewContext);

  if (card) {
    return (
      <div className={`mt-8 overflow-x-hidden overflow-y-auto`} onClick={() => setShowAnswer(!showAnswer)}>
        <div className={`h-[25vh] text-[1.2rem] flex flex-col border border-edMedGray overflow-x-hidden rounded-md`}>
          <MarkdownPreviewer content={card.question} className="flex-1 p-3 h-full bg-elGray dark:bg-edDarker overflow-y-auto" />
        </div >
      </div>
    )
  }
}

function AnswerCard({ card, displayQuestion }) {
  const { showAnswer, flip } = useContext(ReviewContext);

  if (card) {
    return (
      <div className={`mt-8 ${showAnswer ? "mt-4 opacity-100" : "mt-8 opacity-0"}`}>
        <div className={`h-[25vh] text-[1.2rem] flex flex-col border border-edMedGray overflow-x-hidden rounded-md`}>

          {/* If flip=false (The card is at or flipping towards 'question position') AND we're set to display answer 
          (meaning we're still in the 1/2 animation time delay for setting `displayQuestion`), set content to blank 
          so we dont give away the answer to the next question */}
          <MarkdownPreviewer content={!flip && !displayQuestion ? "" : card.answer} className="flex-1 p-3 h-full bg-elGray dark:bg-edDarker overflow-y-auto" />
        </div >
      </div>
    )
  }
}

function FlipFlashcard({ card, displayQuestion }) {
  const { flip, toggleFlip } = useContext(ReviewContext);

  return (
    <div className={`mt-8 flashCard ${flip ? 'flip' : ''}`} onClick={toggleFlip}>
      <div className="h-[50vh] text-[1.2rem] border border-edMedGray text-edWhite flex flex-col justify-center items-center 
          overflow-x-hidden rounded-md"
      >
        <MarkdownPreviewer
          content={!flip && !displayQuestion ? "" : (displayQuestion ? card.question : card.answer)}
          className={`text-2xl flex-1 p-3 h-full bg-elGray dark:bg-edDarker overflow-y-auto ${displayQuestion ? "" : "flashCardBack"}`} // This has to be 'displayQuestion' instead of flip and I'm not sure why
        />
      </div>
    </div>
  )
}

function ShowAnswerButtons() {
  const { showAnswer, toggleFlip, updateReviewedCard } = useContext(ReviewContext);

  const handleKeyPress = (e) => {
    e.preventDefault();
    if (e.key === 'Space' || e.keyCode === 32) {
      toggleFlip();
      return;
    }

    if (showAnswer === false) return;

    if (e.key === 'Enter') {
      updateReviewedCard();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showAnswer]);

  return (
    <div className="flex justify-center mt-8 mb-8">
      {!showAnswer && (
        <button className="button-top relative w-[20%]" onClick={toggleFlip}>
          Reveal Answer <span className="absolute top-0.5 right-0.5 px-1 font-normal bg-edDarkBlue rounded-md">space</span>
        </button>
      )}
      {showAnswer && (
        <button className="button-top relative w-[20%]" onClick={() => updateReviewedCard()}>
          Next <span className="absolute top-0.5 right-0.5 px-1 font-normal bg-edDarkBlue rounded-md">enter</span>
        </button>
      )}
    </div>
  );
}

export default ReviewPage