# bracket-rl
Try it out: https://bracket-rl.vercel.app

This is a tool for building prediction brackets for Rocket League esports tournaments.

## TODO List
The below list is a non-exhaustive list over features that need to be implemented in order of priority.

* Support for the Worlds format:
  - Implement the rules for the different stages. These are: Swiss, double elimination groups, and single elimination.
    - ~~Swiss~~
    - Groups
    - Single elim.
  - Parsing of Liquipedia data for the event.
    - ~~Swiss~~
    - Groups
    - Single elim.
  - Implement a tabbed UI to support different formats in the same event.
  - Implement UIs for the different formats.
    - Swiss
    - Groups
    - Single elim.
* "Live" updates: There should be a backend service that pulls updated standings for ongoing events every minute.
* QOL improvements.
* Support for multiple events, e.g. regionals for all regions.
* Better mobile UI.
