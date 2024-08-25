#!/usr/bin/env groovy

def versionIncrement() {
    echo "Incrementing the app version"

    // Read the current version from package.json
    def packageJson = readJSON file: 'package.json'
    def currentVersion = packageJson.version

    // Parse the version components
    def (major, minor, patch) = currentVersion.tokenize('.')

    // Increment the patch version
    def newPatch = patch.toInteger() + 1
    def newVersion = "${major}.${minor}.${newPatch}"

    // Update package.json with the new version
    sh "npm version ${newVersion} --no-git-tag-version"

    echo "New Image Version Tag is ${newVersion} and ${BUILD_NUMBER}"

    // Return the new version tag combined with the build number
    return "${newVersion}-${BUILD_NUMBER}"
}


def deploy() {
    echo "Deploying the app to EC2 instance"

    def dockerCommand = "docker run -d -p 5000:5000 chamikajay/room-rover-backend:${env.IMAGE_TAG}"

    sshagent(['aws-ec2-ssh']) {
        sh "ssh -o StrictHostKeyChecking=no ec2-user@13.233.109.195 ${dockerCommand}"
    }
}

def commitVersionUpdate() {
    sshagent(['jenkins-github-ssh']) {
        sh 'git config user.email "jenkins@ci-cd.com"'
        sh 'git config user.name "Jenkins User"'
        sh "git remote set-url origin git@github.com:Chamikajaya/room-rover-backend.git"
        sh "git add ."
        sh 'git commit -m "Jenkins Version Bump"'
        sh 'git push origin HEAD:main'
    }
}

return this