var console = console || {};
var net = net || {};
net.hires = net.hires || {};
net.hires.debug = net.hires.debug || {};

net.hires.debug.Stats = function(theme) {
	var _timer = 0,
	_fps = 0,
	_ms = 0,
	_ms_prev = 0,
	_mem = 0,
	_fps_graph = 0,
	_mem_graph = 0,
	_mem_max_graph = 0,
	_mem_max = 0,
	_this = $('hires'),
	fps = $('hires_fps'),
	ms = $('hires_ms'),
	mem = $('hires_mem'),
	memMax = $('hires_memMax'),
	bitmap = $('hires_bmp'),
	stageFrameRate = 32,
	ctx = bitmap.getContext('2d'),
	_graph,
	_currentFPS = 0, 
	_theme = { bg: 0x000033, fps: 0xFFFF00, ms: 0x00FF00, mem: 0x00FFFF, memmax: 0xFF0070 };
	
	if (theme) {
		if (theme.bg != null) _theme.bg = theme.bg;
		if (theme.fps != null) _theme.fps = theme.fps;
		if (theme.ms != null) _theme.ms = theme.ms;
		if (theme.mem != null) _theme.mem = theme.mem;
		if (theme.memmax != null) _theme.memmax = theme.memmax;
	}
	
	_this.style.background = hex2css(_theme.bg);
	fps.style.color = hex2css(_theme.fps);
	ms.style.color = hex2css(_theme.ms);
	mem.style.color = hex2css(_theme.mem);
	memMax.style.color = hex2css(_theme.memmax);
	
	ctx.fillStyle = "rgb(0, 0, 51)";
	ctx.strokeStyle = "rgb(0, 0, 51)";
	ctx.fillRect(0, 0, bitmap.width, bitmap.height);
	
	setInterval(update, 31, this);
	
	this.getFPS = function() { return _currentFPS; }
	
	function update() {
		_timer = new Date().getTime();
		
		if(_timer - 1000 > _ms_prev) {
			_ms_prev = _timer;
			
			if(console.memory) {
				//console.memory.usedJSHeapSize totalJSHeapSize
				_mem = Number((console.memory.usedJSHeapSize * 0.000000954).toFixed(3));
			} else {
				_mem = 0;
			}
			_mem_max = _mem_max > _mem ? _mem_max : _mem;
			
			_fps_graph = Math.min(50, (_fps / stageFrameRate) * 50);
			_mem_graph =  Math.min(50, Math.sqrt(Math.sqrt(_mem * 5000))) - 2;
			_mem_max_graph =  Math.min(50, Math.sqrt(Math.sqrt(_mem_max * 5000))) - 2;
			
			ctx.drawImage(bitmap, 1, 0);
			
			ctx.beginPath();
			ctx.moveTo(0.5, 0);
			ctx.lineTo(0.5, bitmap.height);
			ctx.stroke();
			
			_graph = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
			setPixel(0, Math.round(_graph.height - _fps_graph), "fps");
			setPixel(0, Math.round(_graph.height - ((_timer - _ms) >> 1)), "ms");
			setPixel(0, Math.round(_graph.height - _mem_graph), "mem");
			setPixel(0, Math.round(_graph.height - _mem_max_graph), "memmax");
			ctx.putImageData(_graph, 0, 0);
			
			fps.innerHTML = "FPS: " + _fps + " / " + stageFrameRate;
			mem.innerHTML = "MEM: " + _mem;
			memMax.innerHTML = "MAX: " + _mem_max;
			
			_currentFPS = _fps;
			_fps = 0;
		}
		
		_fps++;
		
		ms.innerHTML = "MS: " + (_timer - _ms);
		_ms = _timer;
	}
	
	function setPixel(x, y, cat) {
		var col = _theme[cat];
		var idx = (y * _graph.width + x) * 4;
		_graph.data[idx + 0] = col >> 16; //R
		_graph.data[idx + 1] = col >> 8 & 0xFF; //G
		_graph.data[idx + 2] = col & 0xFF; //B
		_graph.data[idx + 3] = 255; //A
	}
	
	function hex2css(color) {
		var col = color.toString(16);
		while(col.length < 6) col = "0" + col;
		return "#" + col;
	}
}