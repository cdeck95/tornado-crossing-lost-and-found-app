import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../styles/App.css";

interface BannerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

function Banner(props: BannerProps) {
  if (!props.open) {
    return null;
  }
  const { open, setOpen } = props;

  const leaveFeedback = () => {
    alert("Feedback form coming soon!");
  };

  return (
    <div className="banner">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24px"
        height="24px"
        className="banner-icon"
        viewBox="0 0 24 24"
        style={{
          fill: "rgba(255, 255, 255, 1)",
          transform: "",
          height: "24px",
          msFilter: "",
        }}
      >
        <path d="M11.001 10h2v5h-2zM11 16h2v2h-2z"></path>
        <path d="M13.768 4.2C13.42 3.545 12.742 3.138 12 3.138s-1.42.407-1.768 1.063L2.894 18.064a1.986 1.986 0 0 0 .054 1.968A1.984 1.984 0 0 0 4.661 21h14.678c.708 0 1.349-.362 1.714-.968a1.989 1.989 0 0 0 .054-1.968L13.768 4.2zM4.661 19 12 5.137 19.344 19H4.661z"></path>
      </svg>
      <p className="banner-text">
        This product is in alpha and under active development. Please let us
        know if you encounter errors or have any feedback!
      </p>

      <button className="banner-button" onClick={leaveFeedback}>
        Leave Feedback
      </button>

      <p className="close" onClick={() => setOpen(false)}>
        X
      </p>
    </div>
  );
}

export default Banner;
