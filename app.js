"use strict";
const { app, BrowserWindow, ipcMain } = require("electron");
const { exec } = require("child_process");
const windowStateKeeper = require("electron-window-state");
const http = require("http");
const fs = require("fs");
const WebSocketServer = require("ws").Server;
const path = require("path");
const appRoot = path.join(__dirname, "app");

function createWindow() {
	const winState = windowStateKeeper({
		defaultWidth: 1200,
		defaultHeight: 700,
	});
	const mainWindow = new BrowserWindow({
		x: winState.x,
		y: winState.y,
		width: winState.width,
		height: winState.height,
		minWidth: 1200,
		minHeight: 700,
		frame: false,
		backgroundColor: "#3a3a44",
		webPreferences: {
			nodeIntegration: true,
			preload: appRoot + "/script/preload.js",
		},
	});
	winState.manage(mainWindow);
	mainWindow.loadFile("app/admin.html");
	global.webContent = mainWindow.webContents;
	webContent.openDevTools();
}

app.on("activate", function () {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", function () {
	if (process.platform !== "darwin") app.quit();
});

app.whenReady().then(() => {
	createWindow();
	var localStorage = {};

	ipcMain.on("init", (e, args) => {
		localStorage = args;

		// ------------------ web socket ----------------------
		webContent.ws = new WebSocketServer({ port: localStorage.socketPort }).on("connection", (ws) => {
			ws.onmessage = (e) => {
				var data = JSON.parse(e.data);
				if ((data.about = "initMe")) { 
					ws.send(JSON.stringify({ msg: localStorage, about: "initMe" }));
				} else {
					var spectators = webContent.ws.clients.size - 1;
					webContent.ws.clients.forEach((client) => {
						if (client !== ws) {
							client.send(JSON.stringify({ ...data, spectators }));
						}
					});
				}
			};
		});

		ipcMain.on("loadVideo", (e, args) => {
			localStorage.fileURL = args.fileURL;
			localStorage.fileName = args.fileName;
		});

		ipcMain.on("changeSettings", (e, args) => {
			localStorage = args;
		});

		// ------------------ web server ----------------------
		http.createServer(serverDo).listen(localStorage.serverPort);
		function serverDo(req, res) {
			var url = req.url.split("?");

			if (url[0] === "/") {
				// console.log(url, url[1]);
				if ((!localStorage.password && !url[1]) || url[1] == `p=${localStorage.password}`) {
					req.url = "/user.html";
				} else {
					res.writeHead(404);
					return res.end();
				}
			}
			fs.readFile(appRoot + req.url, (err, data) => {
				if (err) {
					var filePath = req.url.substr(1);
					if (!fs.existsSync(filePath)) {
						res.writeHead(404);
						return res.end();
					}
					return filePath.split(".").pop() === "mp4" ? fileStream(req, res, filePath) : res.end(`err`);
				} else {
					return res.end(data);
				}
			});
		}
	});
});

// ---------------- video file to stream --------------------
function fileStream(req, res, filePath) {
	var range = req.headers.range;
	if (!range) return res.sendStatus(416);

	var positions = range.replace(/bytes=/, "").split("-");
	var start = parseInt(positions[0], 10);

	var stats = fs.statSync(filePath);
	var total = stats.size;

	var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
	var chunksize = end - start + 1;

	res.writeHead(206, {
		"Content-Range": "bytes " + start + "-" + end + "/" + total,
		"Accept-Ranges": "bytes",
		"Content-Length": chunksize,
		"Content-Type": "video/mp4",
	});

	var readStream = fs
		.createReadStream(filePath, { start, end })
		.on("open", function () {
			readStream.pipe(res);
		})
		.on("error", function (err) {
			console.log(err);
			res.end(err);
		});
}

// console.log(global.localStorage);
// webContent.executeJavaScript('fetch("https://jsonplaceholder.typicode.com/users/1").then(resp => resp.json())', true).then((result) => {
// 	// console.log(result);
// });

// //////////////////////////////////
// var msg2 = document.getElementById("msg2");
// var ws2 = new WebSocket("ws://localhost:30333");
// ws2.onmessage = function (ev) {
// 	msg2.innerHTML = ev.data;
// };

// var wsSend2 = document.getElementById("wsSend2");
// wsSend2.onkeyup = () => {
// 	console.log(ws2.extensions);
// 	ws2.send(JSON.stringify({ type: "text", data: wsSend2.value }));
// };

// // Sending String
// connection.send("your message");

// // Sending canvas ImageData as ArrayBuffer
// var img = canvas_context.getImageData(0, 0, 400, 320);
// var binary = new Uint8Array(img.data.length);
// for (var i = 0; i < img.data.length; i++) {
// 	binary[i] = img.data[i];
// }
// connection.send(binary.buffer);

// // Sending file as Blob
// var file = document.querySelector('input[type="file"]').files[0];
// connection.send(file);

// var reader = new FileReader();
// var fileExtention = file.name.split(".")[file.name.split(".").length - 1].toLowerCase();
// if (fileExtention !== "mp4") return console.log(`only mp4 files awolled`);
// reader.readAsDataURL(file);
// reader.onloadend = function () {
// 	localStorage.lastPlay = file.path;
// 	localStorage.videoProgress = 0;
// 	var video = document.getElementById("video");
// 	video.src = reader.result;
// 	video.play();
// 	q.remove();
// };

// var req = new XMLHttpRequest();
// req.open("GET", document.location, false);
// req.send(null);
// this.headers = JSON.parse(req.getResponseHeader("localStorage"));
// this.headers.host = location.host.split(":")[0];

// webContent.on("media-started-playing", () => {});
// webContent.on("media-paused", () => {});
