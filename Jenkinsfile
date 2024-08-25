#!/usr/bin/env groovy

library identifier: "jenkins-shared-lib@main", retriever: modernSCM(
    [
        $class       : 'GitSCMSource',
        remote       : 'https://github.com/Chamikajaya/jenkins-shared-library.git',
        credentialsId: 'GithubCredentials',
    ]
)

def gv

pipeline {
    agent any
    tools {
        nodejs 'nodejs-22.7.0'
    }
    parameters {
        string(name: 'NAME', defaultValue: 'Chamika Jayasinghe', description: 'Executor name')
    }
    stages {
        stage("Init") {
            steps {
                script {
                    echo "Pipeline initiated by ${params.NAME}"

                    sh 'node --version'
                    sh 'npm --version'
                    if (!fileExists('package.json')) {
                        error "package.json not found"
                        }
                    echo "package.json contents: ${readFile('package.json')}"
                    gv = load "script.groovy"
                }
            }
        }
        stage("Version Increment") {
            steps {
                script {
                    env.IMAGE_TAG = gv.versionIncrement()
                    echo "Image tag is: ${env.IMAGE_TAG}"
                }
            }
        }
        stage("Build") {
            steps {
                script {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage("Build Docker Image and Push to Docker Hub") {
            steps {
                script {
                    def imageNameToPass = "chamikajay/room-rover-backend:${env.IMAGE_TAG}"
                    echo "Image name is: ${imageNameToPass}"

                    buildImage imageNameToPass
                    dockerHubLogin()
                    dockerHubPush imageNameToPass
                }
            }
        }
        stage("Deploy") {
            steps {
                script {
                    gv.deploy()
                }
            }
        }
        stage("Commit version update to Git") {
            steps {
                script {
                    gv.commitVersionUpdate()
                }
            }
        }
    }
}