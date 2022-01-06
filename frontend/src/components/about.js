import React, {Component} from 'react';


class About extends Component {
  render () {
    return (
      <div>
        <h1 class='page-title'>About</h1>
        <div class='text-div'>
            <p>
              Follow me (<b>Dj0wns</b>) on <a href="https://twitter.com/Dj0wns">Twitter</a> to keep up to date with new AoEPulse updates and features or reach out with any questions or bug reports!
            </p>
          <h2>Tools and Technologies</h2>
          <ul>
            <li>
              This website is entirely open source! The source code is on GitHub at: <a href="https://github.com/dj0wns/AoE_Openings">https://github.com/dj0wns/AoE_Openings</a>
            </li>
            <li>
              Match histories are pulled from the <a href="https://aoe2.net/">aoe2.net</a> API.
            </li>
            <li>
              Replay files for each of those matches are then pulled from the <a href="https://aoe.ms/">aoe.ms</a> API.
            </li>
            <li>
              The replays are then parsed with the <a href="https://github.com/happyleavesaoc/aoc-mgz">aoc-mgz</a> python library.
            </li>
          </ul>
          <h2>Acknowledgements</h2>
          <ul>
            <li>
              Special thanks to <b>treadmill</b> (<a href="https://www.twitch.tv/tredmil">Twitch</a>) for being with the project since its inception and contributing many hours of testing, idea and project direction discussions.
            </li>
            <li>
              Thanks to <b>Waverly</b> (<a href="https://twitter.com/RogueWaverly">Twitter</a>) for letting me work on this while we were wedding planning, helping with database design, Django API debugging and design, and also coming up with the name!
            </li>
            <li>
              Thanks to <b>zigge</b> for providing high level player insights.
            </li>
          </ul>
          <h2>People you should check out!</h2>
          <ul>
            <li>
              <b>ilovebaskets</b> <a href="https://www.twitch.tv/ilovebaskets">https://www.twitch.tv/ilovebaskets</a>
              <ul>
                <li>
                  Awesome high level 1v1's with a mix of occasional nomad tgs!
                </li>
              </ul>
            </li>
            <li>
              <b>mangomel_</b> <a href="https://www.twitch.tv/mangomel_">https://www.twitch.tv/mangomel_</a>
              <ul>
                <li>
                  Chill 1v1 stream with a fun positive atmosphere!
                </li>
              </ul>
            </li>
            <li>
              <b>Vaurion</b> <a href="https://www.twitch.tv/vaurion">https://www.twitch.tv/vaurion</a>
              <ul>
                <li>
                 1v1 streams with just the right amount of tilt!
                </li>
              </ul>
            </li>
          </ul>
          <p class='copyright-text'>
            Age of Empires II DE © Microsoft Corporation. AoEPulse.com was created under Microsoft's <a href="https://www.xbox.com/en-GB/developers/rules">"Game Content Usage Rules"</a> using assets from Age of Empires II DE, and it is not endorsed by or affiliated with Microsoft.
          </p>
        </div>
      </div>
    )
  }
}

export default About
