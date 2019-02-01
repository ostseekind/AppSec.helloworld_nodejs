#!groovy
     
pipeline {
	agent {
		label 'host'
    }
      
    options {
        buildDiscarder(logRotator(numToKeepStr: '10', daysToKeepStr: '7'))
        disableConcurrentBuilds()
    }
      
    stages {
     
		stage("Set Build Parameters") {
          steps {
            script {
              currentBuild.displayName = "Build_App .${BUILD_NUMBER}";
            }
          }
        }
     
        stage("Build") {
          steps {
            sh 'docker build -t helloworldnodejs ./app'
            sh 'docker run --rm -v ${PWD}/app:/work helloworldnodejs npm install'
            sh 'docker build -t helloworldnodejs ./app'
          }
        }
        
            
        stage("NPM audit") {
          steps {
			script {
				try{
					auditResult = sh(returnStdout: true, script: 'docker run --rm -v ${PWD}/app:/work helloworldnodejs npm audit').trim()
            		echo auditResult
            	}
            	catch(Exception e){
            		currentBuild.result = 'UNSTABLE'
            	}
            }
          }
          
        }
     
        stage("Dependency Check") {
          steps {
			sh 'rm -rf ${PWD}/app/result'
			sh 'mkdir -m 777 ${PWD}/app/result'
     
			sh 'docker run -v ${PWD}:/src -v ${PWD}/app/result/:/result melaniealwardt/dependency-check:latest --scan /src/app --format "ALL" --project app --out /result --noupdate'
          }
        }
     
        stage("Code Quality") {
          steps {
            dir("./app") {
              withSonarQubeEnv('Sonarqube') {
                withCredentials([usernamePassword(credentialsId: 'lidop', passwordVariable: 'rootPassword', usernameVariable: 'rootUser')]) {
                  sh 'docker run --dns ${IPADDRESS} --rm  -v ${PWD}/:/work -e SERVER=http://sonarqube.service.lidop.local:8084/sonarqube -e PROJECT_KEY=helloworldnodejs  registry.service.lidop.local:5000/lidop/sonarscanner:latest'
                }
              }
              timeout(time: 1, unit: 'HOURS') {
                waitForQualityGate abortPipeline: true
              }
              
       
     
            }
          }
          post {
			always{
				sh 'rm -rf ${PWD}/app/result'
			}
          }
        }
              
        stage("Unit Test") {
          steps {
            dir("./app") {
              script {
                try {
                  sh "docker run -d --name helloworldnodejs-unittest helloworldnodejs"
                  sh "docker exec helloworldnodejs-unittest npm test"
                }
                finally {
                  sh "docker rm -f helloworldnodejs-unittest"
                }
              }
            }
          }
        }
     
        stage("Deploy App") {
          steps {
            script {
              try {
                sh "docker rm -f helloworldnodejs"
              }
              catch(err) {
                echo "no running instance."
              }
              finally {
                sh "docker run -d -p 9100:80 --name helloworldnodejs helloworldnodejs"
              }
            }
          }
        }
     
        stage("Integration Test") {
          steps {
            script {
              try{
                dir("./app"){
                  sh 'mkdir -p .results'
                  sh 'until [ $(docker inspect -f {{.State.Running}} helloworldnodejs) = "true" ]; do sleep 1; echo "wait for container start";  done;'
                  sh "docker run --dns ${IPADDRESS} --rm -v $WORKSPACE/.results:/work/.results helloworldnodejs npm run-script itest"
                }
              }
              finally{
                archiveArtifacts  '.results/*.png'
                archiveArtifacts  '.results/reports/*.json'
              }
            }
          }
        }
      
      }
     
      post { 
        always { 
          script {
            currentBuild.description = "goto <a href=https://www.${PUBLIC_IPADDRESS}.xip.io/port/9100/>App</a>"
            try {
              sh "docker rm -f helloworldnodejs-unittest"
            }
            catch(err) {
              echo "No running Container"
            }
          }
        }
      }
     
    }

