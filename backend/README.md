# MapIT backend STEP 2020

This is the backend project for the STEP 2020 Capstone Project called "MapIT".

## Setup

Use:

* `gcloud auth application-default login`

## Maven
### Running locally

    $ mvn clean jetty:run-exploded

### Deploying

    $ mvn clean package appengine:deploy

## Gradle
### Running locally

    $ gradle jettyRun

If you do not have gradle installed, you can run using `./gradlew appengineRun`.

### Deploying

    $ gradle appengineDeploy

If you do not have gradle installed, you can deploy using `./gradlew appengineDeploy`.
