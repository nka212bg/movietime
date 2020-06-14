window.addEventListener("DOMContentLoaded", () => {
	var serverPort = localStorage.serverPort ? localStorage.serverPort : (localStorage.serverPort = 30333);
	var socketPort = localStorage.socketPort ? localStorage.socketPort : (localStorage.socketPort = 30334);
	var username = localStorage.username ? localStorage.username : (localStorage.username = "Spectator");
	var password = localStorage.password ? localStorage.password : (localStorage.password = Date.now());
	var avatar = localStorage.avatar ? localStorage.avatar : (localStorage.avatar = 1);

	console.log(serverPort, socketPort, username, avatar, password);
});
