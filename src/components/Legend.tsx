import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Legend() {
  return (
    <div className="legend">
      <div className="legend-item">
        <FontAwesomeIcon icon={faCircle} style={{ color: "red" }} />
        <span>Claim Expired</span>
      </div>
      <div className="legend-item">
        <FontAwesomeIcon icon={faCircle} style={{ color: "orange" }} />
        <span>New - Pending Owner Notification</span>
      </div>
      <div className="legend-item">
        <FontAwesomeIcon icon={faCircle} style={{ color: "yellow" }} />
        <span>Unclaimed - Owner Notified</span>
      </div>
    </div>
  );
}

export default Legend;
