import React, { useRef, useState } from "react";
import styles from "../CSS/dropbox.module.css";

export default function DropBox() {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");

  const handleChoose = () => inputRef.current?.click();
  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFileName(f.name);
  };

  return (
    <div className={styles.dropboxPage}>
      <div className={styles.dropboxWrapper}>
        <div className={styles.dropbox}>
          <p className={styles.dropboxHint}>Drag file here</p>

          <button type="button" onClick={handleChoose} className={styles.chooseBtn}>
            Choose file
          </button>

          <input ref={inputRef} type="file" onChange={handleChange} className={styles.fileInput} />

          {fileName && <p className={styles.selectedFile}>Selected: {fileName}</p>}
        </div>
      </div>
    </div>
  );
}