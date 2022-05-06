import React, {Component} from 'react';
import MetaSnapshotChart from './metaSnapshotChart.js';


class Home extends Component {
  render () {
    return (
      <div>
        <h1 class='page-title'>Welcome to AoE Pulse!</h1>
        <MetaSnapshotChart/>
        <div class='text-div'>
          <p>
            AoEPulse is an Age of Empires 2 statistics website which parses and stores millions of replays to give never before seen insights on the effectiveness of the different core openings. The data is updated twice daily at 3:00 and 15:00 GMT. This site is primarily focused on 1v1 Arabia (due to it being the only map and mode with enough games to draw meaningful conclusions) but also provides any stats collected for all other maps and Empire Wars where possible. Openings may not be as accurate on these other maps or modes (specifically the different timings of Empire Wars and the uniqueness of nomad don't agree with the heuristics.) I hope these statistics help provide the insights you need to take your game to the next level!
          </p>
        </div>
        <div class='text-div'>
          <h2>Update (May 6, 2022)</h2>
          <p>
            The big release of the Advanced Query interface! Now you can query far more specific matchups as well look up personal stats with your aoe2.net profile id. This id can be found as the trailing numbers on your aoe2.net profile page. For example, Vinchesters's profile link is <a href="https://aoe2.net/#profile-271202">https://aoe2.net/#profile-271202</a> and therefore his profile id is 271202. Every completed response in the advanced query interface will create a unique link that can be copied referenced at any point in the future to see that same data again. This has been a huge project and I am thrilled that it is finally ready to go public!
          </p>
          <h2>Update (Jan 5, 2022)</h2>
          <p>
            Added Straight FC and Unknown openings types to better represent the playerbase (not shown in graph). Openings matchup mirrors were also only half counted in play rate so this has been fixed. You may see a few percent changes in the above graph and on the Opening Stats page. Also added a small about page.
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
