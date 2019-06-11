import {h, Component} from 'preact';
import {getDateStamp, getTimeStamp, getDurationStamp} from './timeHelpers.js';
import Panel from './panel.jsx';

export default class Header extends Component {
  constructor (props) {
    super(props);
    this.export = this.export.bind(this);
  }

  render (props) {
    const startedPlaylistItems = props.playlistItems.filter(item => item.status > 0);
    const firstPlaylistItem = startedPlaylistItems[0]
    const lastPlaylistItem = startedPlaylistItems[startedPlaylistItems.length - 1];
    const startTime = firstPlaylistItem && new Date(firstPlaylistItem.startTime);
    const endTime = lastPlaylistItem && new Date(lastPlaylistItem.endTime);

    return <Panel tag="header" bullet="☰" label={props.title}>
      <div ref={element => this.contentElement = element}>
        <h1>{props.title}</h1>
        <ol>
          {startedPlaylistItems.map((item, index) => {
            return <li>
              <strong>{'#' + (++index)}</strong>
              <span>{item.movie.title}</span>
              <time>{getTimeStamp(item.startTime)}</time>
            </li>;
          })}
        </ol>
        <ul>
          {startTime &&
            <li>
              <strong>Started:</strong>
              <span>{getDateStamp(startTime)} {getTimeStamp(startTime)}</span>
            </li>
          }
          {endTime &&
            <li>
              <strong>Ended:</strong>
              <span>{getDateStamp(endTime)} {getTimeStamp(endTime)}</span>
            </li>
          }
          {startTime && endTime &&
            <li>
              <strong>Duration:</strong>
              <span>{getDurationStamp(endTime - startTime)}</span>
            </li>
          }
        </ul>
      </div>

      <button type="button" onClick={this.export}>Export</button>
      <a hidden download="cosathon-1-2018.txt" ref={element => this.downloadAnchor = element}></a>
    </Panel>;
  }

  export () {
    const rows = Array.from(this.contentElement.querySelectorAll('h1, li'))
    const content = rows.map(row => row.innerText.replace(/\n/g, '  ')).join('\r');
    const data = new Blob([content], {type: 'text/plain'});
    const dataUrl = URL.createObjectURL(data);
    this.downloadAnchor.href = dataUrl;
    this.downloadAnchor.click();
    setTimeout(() => URL.revokeObjectURL(dataUrl), 20);
  }
}
