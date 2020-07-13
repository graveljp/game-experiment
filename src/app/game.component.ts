import { AfterViewInit, ViewChild, Component, ElementRef, HostListener } from '@angular/core';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'game',
  template: `
    <canvas #mycanvas></canvas> `,
  styles: [`
    canvas {
      position: absolute;
      width: 100%;
      height: 100%;
    }`]
})
export class GameComponent implements AfterViewInit {
  @ViewChild('mycanvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  canvas: HTMLCanvasElement | null = null;
  context: CanvasRenderingContext2D | null = null;
  position: Point = {x: 0, y: 0};

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef!.nativeElement;
    this.context = this.canvas.getContext('2d');

    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    this.position = {x: this.canvas.width / 2,
                     y: this.canvas.height / 2};

    window.requestAnimationFrame(
      (time: DOMHighResTimeStamp) => this.draw(time));
  }

  draw(time: DOMHighResTimeStamp): void {

    this.context!.fillStyle = 'rgb(200,200,200)';
    this.context!.fillRect(
      0, 0, this.canvas!.width, this.canvas!.height);

    this.context!.fillStyle = 'purple';
    this.context!.fillRect(
      this.position.x - 5, this.position.y - 5, 10, 10);

    window.requestAnimationFrame(
      (time: DOMHighResTimeStamp) => this.draw(time));
  }

  @HostListener('window:keydown.arrowUp')
  moveUp() {
    if (this.position.y > 10) {
      this.position.y -= 10;
    }
  }

  @HostListener('window:keydown.arrowDown')
  moveDown() {
    if (this.position.y < this.canvas!.height - 10) {
      this.position.y += 10;
    }
  }

  @HostListener('window:keydown.arrowLeft')
  moveLeft() {
    if (this.position.x > 10) {
    this.position.x -= 10;
    }
  }

  @HostListener('window:keydown.arrowRight')
  moveRight() {
    if (this.position.x < this.canvas!.width - 10) {
      this.position.x += 10;
    }
  }
}
