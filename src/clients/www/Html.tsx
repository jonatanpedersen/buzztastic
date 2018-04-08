export const Html = ({ baseHref, body, title }) => `
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<base href=${baseHref} />
		<link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro" rel="stylesheet">
		<link rel="author" href="humans.txt">
		<title>${title}</title>
		<link href="style.css" rel="stylesheet">
	</head>
	<body class="body">
		<div class="app">${body}</div>
		<script src="/socket.io/socket.io.js"></script>
		<script src="index.js"></script>
	</body>
</html>
`;