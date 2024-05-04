import { useState, useRef } from "react";
import { useMutation, useQuery } from 'react-query';
import { Link, useParams } from "react-router-dom";
import Sidebar from "./SideBar";
import { useApi } from "../api";
import ReactPlayer from 'react-player';
import { BlockMath } from 'react-katex';
import sanitizeHtml from 'sanitize-html';
import katex from 'katex';
import partyPopperImg from '../assets/party-popper.png'
import partyPopperFlipImg from '../assets/party-popper-flip.png'

{/* <div className="overflow-hidden rounded-md bg-white px-4 py-2 h-[30vh] mt-8">
<div className="flex flex-col items-center text-black overflow-hidden" > */}

{/* <div className="overflow-hidden rounded-md">
<div className={`${cardCSS}`} > */}

// const cardCSS = "bg-white px-4 py-2 flex flex-col items-center text-black h-[30vh] mt-8 overflow-auto"

const cardOuterCSS = "bg-white mt-8 rounded-md overflow-hidden"
const cardInnerCSS = "bg-white h-[30vh] px-4 py-2 text-black flex flex-col items-center overflow-auto"

function QuestionCard({ card }) {
  return (
    <div className={`${cardOuterCSS}`}>
      <div className={`${cardInnerCSS}`} >
        <div dangerouslySetInnerHTML={{ __html: card.question }}></div>
        {ReactPlayer.canPlay(card.questionvideolink) && (
          <ReactPlayer
            url={card.questionvideolink}
            controls={true}
            style={{ maxWidth: '80%', maxHeight: '80%' }} // ReactPlayer is likely incompatible with Tailwind
          />
        )}
        {card.questionimagelink && <img src={card.questionimagelink} className="max-w-[80%] max-h-[80%]" />}
        {card.questionlatex && <KatexOutput latex={card.questionlatex} />}
      </div>
    </div>
  )
}

function AnswerCard({ card, showAnswer }) {
  return (
    <div className={`${cardOuterCSS} transition-all duration-300 ${showAnswer ? "mt-8 opacity-100" : "mt-16 opacity-0"}`}>
      <div className={`${cardInnerCSS}`} >
        {showAnswer && <div dangerouslySetInnerHTML={{ __html: card.answer }} />}
        {ReactPlayer.canPlay(card.answervideolink) && showAnswer && (
          <ReactPlayer
            url={card.answervideolink}
            controls={true}
            style={{ maxWidth: '80%', maxHeight: '80%' }} // ReactPlayer is likely incompatible with Tailwind
          />
        )}
        {card.answerimagelink && showAnswer && <img src={card.answerimagelink} style={{ maxWidth: '80%', maxHeight: '80%' }} />}
        {card.answerlatex && showAnswer && <KatexOutput latex={card.answerlatex} />}
      </div>
    </div>
  )
}

function ShowAnswerButtons({ card, showAnswer, setShowAnswer, updateReviewedCard }) {
  const changeShowAnswer = () => {
    setShowAnswer(true);
  };

  const confidence_scale_factors = {
    1: 0,     // Set interval to 0
    2: 0.75,  // Decrease interval by 25%
    3: 1,     // Same interval
    4: 1.5    // Increase interval by 50%
  }

  const now = new Date();

  // 8 hours in milliseconds
  const baseInterval = 28800000;
  const bucketMultiplier = Math.pow(3, card.bucket);

  const getNextReviewTime = (confidence_level) => {
    return new Date(now.getTime() + (baseInterval * bucketMultiplier * confidence_scale_factors[confidence_level]));
  }

  const formatTimeDifference = (startTime, endTime) => {
    // Time difference in milliseconds
    const timeDiff = endTime - startTime;

    // Convert milliseconds to days
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Convert remaining milliseconds to hours
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    // Convert remaining milliseconds to minutes and round to nearest minute
    const minutes = Math.round((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    let formattedTime = '';
    if (days > 0) {
      formattedTime += `${days}d `;
    }
    if (hours > 0 && days <= 4) {
      formattedTime += `${hours}h `;
    }
    if (days === 0 && hours <= 4) { // Only show minutes if there are minutes or if the time is less than 1 hour
      formattedTime += `${minutes}m`;
    }

    return formattedTime.trim(); // Trim any trailing whitespace (which is left to account for a possible next unit, ex: "2d 3h")
  }

  return (
    <div className="fixed bottom-8 left-0 right-0 mx-auto w-[30vw] flex justify-center">
      {!showAnswer && <button className="mt-8 border rounded-md w-[50%]" onClick={changeShowAnswer}>Reveal Answer</button>}
      {
        showAnswer && (
          <div className="flex justify-center mt-28">
            <button className="rounded-md w-24 px-4 mr-4 text-black bg-red-600 hover:bg-red-700" onClick={() => updateReviewedCard(0, getNextReviewTime(1), card)}>Again <br />
              {formatTimeDifference(now.getTime(), getNextReviewTime(1))}</button>

            <button className="rounded-md w-24 px-4 mr-4 text-black bg-yellow-400 hover:bg-yellow-500" onClick={() => updateReviewedCard(card.bucket + 1, getNextReviewTime(2), card)}>Hard <br />
              {formatTimeDifference(now.getTime(), getNextReviewTime(2))}</button>

            <button className="rounded-md w-24 px-4 mr-4 text-black bg-green-700 hover:bg-green-800" onClick={() => updateReviewedCard(card.bucket + 1, getNextReviewTime(3), card)}>Good <br />
              {formatTimeDifference(now.getTime(), getNextReviewTime(3))}</button>

            <button className="rounded-md w-24 px-4 text-black bg-green-400 hover:bg-green-500" onClick={() => updateReviewedCard(card.bucket + 1, getNextReviewTime(4), card)}>Easy <br />
              {formatTimeDifference(now.getTime(), getNextReviewTime(4))}</button>
          </div>
        )
      }
    </div>
  )
}

function FinishView(deckId) {
  return (
    <div className="flex flex-row justify-center items-center mt-[10vh]">
      <img className="w-40 h-40 mt-[-10vh]" src={partyPopperFlipImg} alt="Party Popper" />
      <div className="flex flex-col justify-center items-center mx-4">
        <h3 className="h-[25vh] flex justify-center items-center w-full border-black bg-white rounded-md p-5 text-2xl text-black my-4">You have studied all the cards in this deck</h3>
        <Link to={`/decks/${deckId.deckId}`}>
          <button className="border rounded-md px-2 py-1">Back to deck</button>
        </Link>
      </div>
      <img className="w-40 h-40 mt-[-10vh]" src={partyPopperImg} alt="Party Popper" />
    </div>
  )
}

function ReviewCard({ card, showAnswer, setShowAnswer, updateReviewedCard }) {
  const changeShowAnswer = () => {
    setShowAnswer(true);
  };

  const KatexOutput = ({ latex }) => {
    const html = katex.renderToString(latex, {
      throwOnError: false,
      output: "html"
    });

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <div className={`flex flex-col items-center h-auto w-[30vw] mx-auto`}>
          <div className="w-full">
            <QuestionCard card={card}></QuestionCard>
            <AnswerCard card={card} showAnswer={showAnswer}></AnswerCard>
          </div>
        </div>
      </div>
      <ShowAnswerButtons card={card} showAnswer={showAnswer} setShowAnswer={setShowAnswer} updateReviewedCard={updateReviewedCard}></ShowAnswerButtons>
    </>
  );
}

function Review() {
  const api = useApi();

  const [cardIndex, setCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [finish, setFinish] = useState(false);
  const { deckId } = useParams();

  // Fetch reviews info
  const { data: reviews, isLoading, error } = useQuery({
    queryFn: () =>
      api._get(`/api/reviews/${deckId}`).then((response) => response.json()),
  });

  const updateReviewedCard = (newBucket, nextReviewTime, card) => {
    const formatTime = (time) => {
      return time.toISOString();
    }

    api._patch(
      `/api/cards/${card.card_id}`,
      { bucket: newBucket, next_review: formatTime(nextReviewTime) }
    )
      .then(response => {
        if (response.ok) {
          if (cardIndex < reviews.cards.length - 1) {
            setCardIndex(cardIndex + 1);
            setShowAnswer(false);
          } else {
            setFinish(true);
          }
        } else {
          console.error('Failed to update next_review');
        }
      })
      .catch(error => {
        console.error('Error updating next_review:', error);
      });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Check if reviews data is available
  if (!reviews || !reviews.cards || reviews.cards.length === 0) {
    return <div>No cards found for review.</div>;
  }

  return (
    <>
      <Sidebar />
      <div className="rounded-lg mt-[2%] h-[60vh] w-[40vw] flex flex-col">
        <h2 className="text-center text-[2em] border-b">{reviews.deck_name}</h2>
        {!finish && (
          <ReviewCard
            card={reviews.cards[cardIndex]}
            showAnswer={showAnswer}
            setShowAnswer={setShowAnswer}
            updateReviewedCard={updateReviewedCard}
          />
        )}
        {finish && <FinishView deckId={deckId} />}
      </div>
    </>
  );
}

export default Review