import React, { Component } from "react";
import UploadService from "../services/upload-files.service";

export default class UploadFiles extends Component {
  constructor(props) {
    super(props);
    this.selectFiles = this.selectFiles.bind(this);
    this.upload = this.upload.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);

    this.state = {
      selectedFiles: undefined,
      progressInfos: [],
      message: [],

      fileInfos: [],
    };
  }

  componentDidMount() {
    UploadService.getFiles().then((response) => {
      this.setState({
        fileInfos: response.data,
      });
    });
  }

  selectFiles(event) {
    this.setState({
      progressInfos: [],
      selectedFiles: event.target.files,
    });
  }

  upload(idx, file) {
    let _progressInfos = [...this.state.progressInfos];

    UploadService.upload(file, (event) => {
      _progressInfos[idx].percentage = Math.round((100 * event.loaded) / event.total);
      this.setState({
        _progressInfos,
      });
    })
      .then((response) => {
        this.setState((prev) => {
          let nextMessage = [...prev.message, "Uploaded the file successfully: " + file.name];
          return {
            message: nextMessage
          };
        });

        return UploadService.getFiles();
      })
      .then((files) => {
        this.setState({
          fileInfos: files.data,
        });
      })
      .catch(() => {
        _progressInfos[idx].percentage = 0;
        this.setState((prev) => {
          let nextMessage = [...prev.message, "Could not upload the file: " + file.name];
          return {
            progressInfos: _progressInfos,
            message: nextMessage
          };
        });
      });
  }

  uploadFiles() {
    var file = document.getElementById('selectedFile').files[0];
        var filename = file.name;
        console.log(filename);
        //AAN TE PASSEN NAAR API + FILENAME
        var url = 'http://URLNAARUWAPI' + filename;
        var client = new HttpClient();
        client.get(url, function (response) {

            var body = JSON.parse(response)
            var preURL = body.url;
            console.log(preURL)

            //START PUT TO S3 BUCKET
            var xhr = new XMLHttpRequest();
            xhr.open('PUT', preURL, true);
            xhr.onload = () => {
                if (xhr.status === 200) {
                    console.log('Tis gelukt e!');
                }
            };
            xhr.onerror = () => {
                console.log('Kapoet')
            };
            xhr.send(file);
        });
        
        var HttpClient = function () {
          this.get = function (aUrl, aCallback) {
              var anHttpRequest = new XMLHttpRequest();
              anHttpRequest.onreadystatechange = function () {
                  if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                      aCallback(anHttpRequest.responseText);
              }
  
              anHttpRequest.open("GET", aUrl, true);
              anHttpRequest.send(null);
          }
      }
  }

  

  render() {
      const { selectedFiles, progressInfos, message, fileInfos } = this.state;

  return (
    <div>
      {progressInfos &&
        progressInfos.map((progressInfo, index) => (
          <div className="mb-2" key={index}>
            <span>{progressInfo.fileName}</span>
            <div className="progress">
              <div
                className="progress-bar progress-bar-info"
                role="progressbar"
                aria-valuenow={progressInfo.percentage}
                aria-valuemin="0"
                aria-valuemax="100"
                style={{ width: progressInfo.percentage + "%" }}
              >
                {progressInfo.percentage}%
              </div>
            </div>
          </div>
        ))}

      <div className="row my-3">
        <div className="col-8">
          <label className="btn btn-default p-0">
            <input type="file" multiple onChange={this.selectFiles} />
          </label>
        </div>

        <div className="col-4">
          <button
            className="btn btn-success btn-sm"
            disabled={!selectedFiles}
            onClick={this.uploadFiles}
          >
            Upload
          </button>
        </div>
      </div>

      {message.length > 0 && (
        <div className="alert alert-secondary" role="alert">
          <ul>
            {message.map((item, i) => {
              return <li key={i}>{item}</li>;
            })}
          </ul>
        </div>
      )}

      <div className="card">
        <div className="card-header">Geuploaden bestanden</div>
        <ul className="list-group list-group-flush">
          {fileInfos &&
            fileInfos.map((file, index) => (
              <li className="list-group-item" key={index}>
                <a href={file.url}>{file.name}</a>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

}

