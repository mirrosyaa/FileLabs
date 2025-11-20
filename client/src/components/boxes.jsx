import React from "react";
import styles from "../CSS/boxes.module.css";

function Boxes() {
  return (
    <div className={styles["boxes-container"]}>
      <div className={styles.box}>Tool 1</div>
      <div className={styles.box}>Tool 2</div>
      <div className={styles.box}>Tool 3</div>
      <div className={styles.box}>Tool 4</div>
      <div className={styles.box}>Tool 5</div>
      <div className={styles.box}>Tool 6</div>
    </div>
  );
}

export default Boxes;
