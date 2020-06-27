import React, { useRef, useState, useEffect } from "react";
import "./ImageUpload.css";

import Button from "./Button";

const ImageUpload = (props) => {
  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const [isValid, setIsValid] = useState(false);

  const filePickerRef = useRef();

  const pickImageHandler = () => {
    filePickerRef.current.click(); //we utilize the input element without seeing it, using ref.
  };

  const pickedHandler = (event) => {
    /*
    OnChange of the input file element is triggered when a file is selected, and invokes
    a callback to this function 
    */
    let pickedFile;
    let fileIsValid = isValid;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
      setIsValid(true);
      fileIsValid = true;
    } else {
      setIsValid();
      fileIsValid = false;
    }
    /*
    We have another variable to represent file validation because the isValid 
    state update is not guranteed to occur before invoking onInput.
    */

    props.onInput(props.id, pickedFile, fileIsValid);
  };

  useEffect(() => {
    /*
      Generates image preview on file state change
      */
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      /*
          this function executes after reading and parsing the file by the filereader is done 
      */
      setPreviewUrl(fileReader.result);
    };

    fileReader.readAsDataURL(file);
  }, [file]);

  return (
    <div className="form-control">
      {/* class name is in Input.css, but as every css class it's available globally */}
      <input
        id={props.id}
        type="file"
        style={{ display: "none" }}
        accept=".jpg,.png,.jpe"
        ref={filePickerRef}
        onChange={pickedHandler}
      />
      <div className={`image-upload ${props.center && "center"}`}>
        <div className="image-upload__preview">
          {previewUrl && <img src={previewUrl} alt="Preview" />}
          {!previewUrl && <p>Please pick an image.</p>}
        </div>
        <Button type="button" onClick={pickImageHandler}>
          PICK IMAGE
        </Button>
      </div>
      {!isValid && <p>{props.errorText}</p>}
    </div>
  );
};

export default ImageUpload;
