<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cabinet</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap" rel="stylesheet">
    <style>
        body {
            background-color: #FFFFFF;
            color: #000000;
            font-family: 'Noto Sans', sans-serif;
            margin: 0;
            padding: 0;
        }
        header {
            text-align: center;
            padding: 50px 0;
            border-bottom: 1px solid #D9D9D9;
        }
        header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        header p {
            margin: 10px 0 0;
            color: #D9D9D9;
        }
        main {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            padding: 20px;
        }
        .project {
            margin: 10px;
            border: 1px solid #D9D9D9;
            border-radius: 5px;
            overflow: hidden;
            width: 300px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .project img {
            width: 100%;
            height: auto;
        }
        .project h2 {
            margin: 0;
            padding: 10px;
            font-size: 1.5em;
            background-color: #f0f0f0;
        }
        .project p {
            padding: 0 10px 10px;
            color: #D9D9D9;
        }
        @media (max-width: 600px) {
            header h1 {
                font-size: 2em;
            }
            .project {
                width: 90%;
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>Cabinet</h1>
        <p>History</p>
    </header>
    <main>
        <div class="project">
            <img src="" alt="Project 1">
            <h2>프로젝트 1</h2>
            <p>프로젝트 설명</p>
        </div>
        <div class="project">
            <img src="" alt="Project 2">
            <h2>프로젝트 2</h2>
            <p>프로젝트 설명</p>
        </div>
        <div class="project">
            <img src="" alt="Project 3">
            <h2>프로젝트 3</h2>
            <p>프로젝트 설명</p>
        </div>
    </main>
</body>
</html>
