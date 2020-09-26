# Booking Challenge

## Background

Spill works with a lot of counsellors and users. Users can book sessions based on a variety of criteria.

A subset of the factors that come into play are: availability, appointment type, appointment medium (phone/video). You will only need to concentrate on these factors for the challenge.

## The Challenge

Build a Node.js API with multiple endpoints.

- `GET` endpoint that given `date_range`, `appointment_type` and `appointment_medium` returns a selection of available appointment times.
- `POST` endpoint that counsellors can use to add their availability. It should accept multiple `dates` and `times`.

We have provided a json file with data.

**Things to consider:**

- schema structure
- edge cases
- testing
- naming/readability
- file structure

## Requirements

- [ ] duplicate this repo (do not fork it) please do not name your repo `Spill Coding Challenge` or anything similar - we don't want future applicants copying your code
- [ ] create the API using Node.js according to the above specifications
- [ ] you need to store the `data.json` file in a database
- [ ] you **do not** need to host the API
- [ ] write max `300` words in a markdown file in your repo on why you made the technical decisions you did
- [ ] include instructions on how to run it locally including the database
- [ ] send us a link to the repo (if the repo is private we will tell you who to add as a collaborator)
