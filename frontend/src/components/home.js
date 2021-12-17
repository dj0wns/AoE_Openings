import React, {Component} from 'react';
import MetaSnapshotChart from './metaSnapshotChart.js';


class Home extends Component {
  render () {
    return (
      <div>
        <MetaSnapshotChart/>
        <h1 class='page-title'>Welcome to AoE Pulse!</h1>
        <div class='text-div'>
          <h2>Update (Dec 14, 2021)</h2>
          <p>
            Variety of bug fixes and added an about page.
          </p>
          <h2>Update (Dec 2, 2021)</h2>
          <p>
            Another large set of work to move the data from sqlite3 to postgres. Worlds faster and requests are no longer blocking so the site should feel a whole lot more responsive as a whole. Also added endpoints and infrastructure to update matches remotely, so now I can hide that behind a cron job rather than updating data every... few months by hand. Cheers!
          </p>
          <h2>Update (Nov 26, 2021)</h2>
          <p>
            Big rewrite of the database to improve scaling and responsiveness with up to 200x speedups for some of the biggest queries! I never expected to have >1M replays analyzed when I started this project. Next big project is adding an endpoint and infrastructure to automatically update the website as I download and parse new replays.
          </p>
          <h2>Alpha release (Oct 5, 2021)</h2>
          <p>
            Initial release with 1 patch worth of data and 400k replays! Some queries take forever but the site all works at least.
          </p>
        </div>
      </div>
    )
  }
}

export default Home
