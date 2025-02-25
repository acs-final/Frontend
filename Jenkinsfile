pipeline {
    agent any
    environment {
        BUILD_NUMBER = "v5"  // 빌드 번호
        IMAGE_NAME = "192.168.2.141:443/prototype/moai-front"  // Harbor 이미지 경로
        HARBOR_CREDENTIALS = credentials('harbor') // Jenkins에 등록한 Harbor Credentials ID
        NEXT_PUBLIC_REDIRECT_URI = "https://d768-118-218-200-33.ngrok-free.app/cognitoresponse" 
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-token',  // Jenkins에 등록한 GitHub Credentials ID
                    url: 'https://github.com/acs-final/Frontend.git'  // GitHub 저장소 URL
            }
        }
        // "빌드 전" 소나큐브 분석 단계
        stage('SonarQube Analysis') {
            steps {
                // Jenkins에 등록한 SonarQube 서버 이름을 넣어주세요 (예: 'My SonarQube')
                withSonarQubeEnv('MySonarQube') {
                    // Global Tool Configuration에 등록한 스캐너 이름(예: 'LocalSonarScanner')
                    def scannerHome = tool 'LocalSonarScanner'
                    
                    sh """
                    ${scannerHome}/bin/sonar-scanner \
                      -Dsonar.projectKey=my_project_key \
                      -Dsonar.projectName=MyProject \
                      -Dsonar.projectVersion=1.0 \
                      -Dsonar.sources=. \
                      -Dsonar.host.url=http://192.168.3.131:9000
                      // (필요 시) -Dsonar.login=${SONAR_TOKEN}
                    """
                }
            }
        }

        stage('Login to Harbor') {
            steps {
                script {
                    // Harbor 로그인
                    sh "docker login -u ${HARBOR_CREDENTIALS_USR} -p ${HARBOR_CREDENTIALS_PSW} 192.168.2.141:443"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Start to Build the Image"
  	  	echo "NEXT_PUBLIC_REDIRECT_URI=${NEXT_PUBLIC_REDIRECT_URI}"  // 변수 값 출력 (디버깅용)
                sh "docker build --build-arg NEXT_PUBLIC_REDIRECT_URI=${NEXT_PUBLIC_REDIRECT_URI} -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
                echo "Build Success"
            }
        }

        stage('Push Image to Harbor') {
            steps {
                echo "Pushing Image to Harbor"
                sh "docker push ${IMAGE_NAME}:${BUILD_NUMBER}"
                echo "Push Success"
            }
        }
    }

}

