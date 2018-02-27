class TestPatternBackground {
  constructor(el) {
    this._el = el;
    this._ctx = this._el.getContext("2d");

    window.addEventListener("resize", () => { this.refresh(); });
    this.refresh();
  }

  refresh() {
    // calling getComputedStyle on every resize step, mainly because I hate
    // performance.
    let compStyle = window.getComputedStyle(this._el, null);
    this._height = parseInt(compStyle.getPropertyValue("height"), 10);
    this._width = parseInt(compStyle.getPropertyValue("width"), 10);
    this._el.setAttribute("height", this._height);
    this._el.setAttribute("width", this._width);

    this.drawColorTestPlates();
    this.drawGrayscaleTestPlates();
    this.drawScreenEdges();
    this.drawProportionCircle();
  }

  drawColorTestPlates() {
    let colors = [
      "rgb(255, 0, 0)",
      "rgb(0, 255, 0)",
      "rgb(0, 0, 255)",
      "rgb(0, 255, 255)",
      "rgb(255, 0, 255)",
      "rgb(255, 255, 0)",
      "rgb(0, 0, 0)"
    ];

    let ctx = this._ctx;
    let plateHeight = Math.round(this._height / 2);
    let plateWidth = Math.round(this._width / colors.length);

    colors.forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.fillRect(index * plateWidth, 0, plateWidth, plateHeight);
    });
  }

  drawGrayscaleTestPlates() {
    let steps = 7;
    let stepDelta = 100 / steps;

    let ctx = this._ctx;
    let plateHeight = Math.round(this._height / 2);
    let plateWidth = Math.round(this._width / steps);

    for (let i = 0; i < steps; i++) {
      ctx.fillStyle = `hsl(0, 0%, ${100 - stepDelta * i}%)`;
      ctx.fillRect(i * plateWidth, plateHeight, plateWidth, plateHeight);
    }
  }

  drawScreenEdges() {
    let ctx = this._ctx;

    ctx.strokeStyle = "rgb(255, 0, 255)";
    ctx.lineWidth = 16;
    ctx.strokeRect(0, 0, this._width, this._height);
  }

  drawProportionCircle() {
    let ctx = this._ctx;

    let x = this._width / 2;
    let y = this._height / 2;
    let baseRadius = (Math.min(this._width, this._height) / 2) - 40;

    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.arc(x, y, baseRadius, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "rgb(255, 255, 255)";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(x, y, baseRadius, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

class TimestampView {
  constructor(dateEl, timeEl) {
    this._dateEl = dateEl;
    this._timeEl = timeEl;

    this.animationFrame();
  }

  refresh() {
    let pad = (i, l = 2) => i.toString().padStart(l, "0");
    let date = new Date();

    let year = date.getUTCFullYear();
    let month = pad(date.getUTCMonth() + 1);
    let day = pad(date.getUTCDay());
    let hours = pad(date.getUTCHours());
    let minutes = pad(date.getUTCMinutes());
    let seconds = pad(date.getUTCSeconds());
    let milliseconds = pad(date.getUTCMilliseconds(), 3);

    this._dateEl.textContent = `${year}-${month}-${day}`;
    this._timeEl.textContent = `${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  }

  animationFrame() {
    this.refresh();
    window.requestAnimationFrame(this.animationFrame.bind(this));
  }
}

class RegularBeep {
  constructor() {
    this._beeping = false;
    this._ctx = new window.AudioContext();

    this.animationFrame();
  }

  onBeepEnd() {
    this._beeping = false;
  }

  beep() {
    this._beeping = true;

    let oscillator = this._ctx.createOscillator();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(550, this._ctx.currentTime);
    oscillator.connect(this._ctx.destination);
    oscillator.addEventListener("ended", this.onBeepEnd.bind(this));

    oscillator.start();
    oscillator.stop(this._ctx.currentTime + 1);
  }

  animationFrame() {
    if (!this._beeping && ((new Date()).getSeconds()+1) % 15 == 0) {
      this.beep();
    }

    window.requestAnimationFrame(this.animationFrame.bind(this));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new RegularBeep();
  new TestPatternBackground(document.getElementById("patternbg"));
  new TimestampView(
    document.querySelector("#date span"),
    document.querySelector("#timestamp span")
  );
});
