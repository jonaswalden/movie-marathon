import {h, Component} from 'preact';
import {getDateStamp, getTimeStamp, getDurationStamp} from './timeHelpers.js';
import Panel from './panel.jsx';

const rowLength = 42;

export default class Header extends Component {
  constructor (props) {
    super(props);
    this.export = this.export.bind(this);
  }

  render (props, state) {
  	const dataTable = this.buildTable(props);
    return <Panel tag="header" bullet="☰" label={props.title}>
     	<pre ref={element => this.pre = element}>{dataTable}</pre>

      <button type="button" onClick={this.export}>🡇 Export</button>
      <a hidden="true" download="" ref={element => this.downloadAnchor = element}></a>
    </Panel>;
  }

  buildTable (props) {
    const startedPlaylistItems = props.playlistItems.filter(item => item.status > 0);
    const firstPlaylistItem = startedPlaylistItems[0]
    const lastPlaylistItem = startedPlaylistItems[startedPlaylistItems.length - 1];

    const table = {
    	head: props.title,
    	body: startedPlaylistItems
	    	.map((item, index) => [`#${++index}`.padEnd(3, ' '), item.movie.title, getTimeStamp(item.startTime)]),
    	foot: {
    		started: getDateStamp() + ' ' + getTimeStamp(),
    		ended: getDateStamp() + ' ' + getTimeStamp(),
    		duration: getDurationStamp(),
    	},
    };

    if (firstPlaylistItem && lastPlaylistItem) {
	    const startTime = new Date(firstPlaylistItem.startTime);
	    const endTime = new Date(lastPlaylistItem.endTime);
    	table.foot.started = getDateStamp(startTime) + ' ' + getTimeStamp(startTime);
   		table.foot.ended = getDateStamp(endTime) + ' ' + getTimeStamp(endTime);
   		table.foot.duration = getDurationStamp(endTime - startTime);
   	}

    const rows = [].concat(
    	table.head.padStart(rowLength / 2 + table.head.length / 2, ' '),
    	'',
    	table.body
    		.map(padRow.bind(null, 2)),
	    '',
	    '–'.repeat(rowLength),
	    '',
	    Object.entries(table.foot)
	    	.map(([key, value]) => [key.charAt(0).toUpperCase() + key.slice(1) + ':', value])
	    	.map(padRow.bind(null, 1))
    );

    return rows.join("\r\n");
  }

  export () {
    const data = new Blob([this.pre.textContent], {type: 'text/plain'});
    const filename = this.props.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '') + '.txt';
    const dataUrl = URL.createObjectURL(data);
    this.downloadAnchor.href = dataUrl;
    this.downloadAnchor.download = filename;
    this.downloadAnchor.click();

    setTimeout(() => URL.revokeObjectURL(dataUrl), 20);
  }
}

function padRow (padPoint, items) {
	const itemsLength = items.reduce((length, item) => length + item.length, 0);
	const paddingLength = rowLength - itemsLength - items.length;
	const padding = '.'.repeat(paddingLength);
	return []
		.concat(
			items.slice(0, padPoint),
			padding,
			items.slice(padPoint)
		)
		.join(' ');
}
