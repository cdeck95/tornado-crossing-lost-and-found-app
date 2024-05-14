import React, { useState } from "react";
import "../styles/FAQ.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquareCaretUp,
  faSquareCaretDown,
} from "@fortawesome/free-solid-svg-icons";

interface FAQItem {
  question: string;
  answer: string;
}

function FAQ() {
  const [expanded, setExpanded] = useState<boolean[]>(
    FAQData.map((_, index) => index === 0)
  );
  const course = process.env.REACT_APP_COURSE_NAME;

  const toggleAnswer = (index: number) => {
    setExpanded((prev) =>
      prev.map((value, i) => (i === index ? !value : false))
    );
  };

  return (
    <div className="faq-page">
      <h1 className="header">{course} L & F</h1>
      <h2 className="FAQ-Header">Frequently Asked Questions</h2>

      {FAQData.map((item, index) => (
        <div className="faq-section" key={index}>
          <div
            className="question-container"
            onClick={(e) => {
              e.stopPropagation();
              toggleAnswer(index);
            }}
          >
            <h2 className="question">{item.question}</h2>

            {expanded[index] ? (
              <FontAwesomeIcon icon={faSquareCaretUp} className="icon" />
            ) : (
              <FontAwesomeIcon icon={faSquareCaretDown} className="icon" />
            )}
          </div>
          {expanded[index] && <p className="answer">{item.answer}</p>}
        </div>
      ))}
    </div>
  );
}

const FAQData: FAQItem[] = [
  {
    question: "How do I pick up my disc?",
    answer:
      "To pick up your disc, contact one of our volunteers via text to coordinate a time to retrieve it. A min of 12 hours lead-time is required. Do not just show up at the course and expect to get your disc back. You can reach out to Michael Sheehan @ 856-520-0425 to schedule a pickup window.",
  },
  {
    question: "How long do I have to claim my disc?",
    answer:
      'You must claim your disc within 120 days of the "date found". After this date, the disc may be marked as "For Sale" and you may lose the ability to claim it. It\'s essential to take action immediately to avoid this situation if you wish to claim your disc.',
  },
  {
    question: "Can I report my disc as lost?",
    answer:
      "At the moment, only administrators have the ability to add discs to the inventory. Self-reporting lost discs is not available. If you believe your disc is lost, it's advisable to check the inventory through the app or contact the course staff to inquire if it has been found.",
  },
  {
    question: "What should I do if I'm unable to collect my disc?",
    answer:
      'If you find yourself unable to collect your disc, you have the option to "surrender" it. This means your disc will be placed in our for sale bin(s), and the proceeds will go towards supporting our course. We\'re also working on incorporating a feature on our website that allows for disc shipping in the near future. If this option interests you, please reach out to one of our volunteers to explore its availability.',
  },
  {
    question: "How do I see if my disc is in the inventory?",
    answer:
      "To check if your disc is in the inventory, navigate to the app's inventory page. You can search for your disc by name, course, or other identifying information. If your disc has been found and reported by an administrator, it will appear in the search results.",
  },
  {
    question: "How do I know when my disc is added?",
    answer:
      "If your disc has a visible phone number written on it, you will be notified via text. Once a day, the system sends a text for every new disc added to the inventory.",
  },
  {
    question: "How does a disc appear in the inventory?",
    answer:
      "Discs are added to the inventory by volunteers when they find a disc on the course or if one is returned in the L&F bin. The volunteer will enter the relevant information about the disc (name, color, plastic) into the system, including any information written on the disc like a persons name and phone number. This makes the disc visible in the inventory.",
  },
];

export default FAQ;
