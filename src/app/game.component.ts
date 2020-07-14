import { AfterViewInit, ViewChild, Component, ElementRef, HostListener } from '@angular/core';

interface Point {
  x: number;
  y: number;
}

interface Dimentions {
  width: number;
  height: number;
}

enum CellContent {
  Empty = 0,
  Snake = 1,
  Apple = 2
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
  apple: HTMLImageElement = new Image();

  position: Point = {x: 0, y: 0};
  direction: Point = {x: 1, y: 0};
  newDirection: Point | null = null;

  cellSize = 32;
  gridDimentions: Dimentions = {width: 0, height: 0};
  grid: CellContent[][] = [[]]
  snake: Point[] = [];

  lastFrameTime = new Date().getTime();
  timeCounter = 0.0;
  
  gameOver = false;

  ngAfterViewInit(): void {
    this.startGame();
  }

  startGame(): void {
    this.grid = [[]]
    this.snake = [];

    this.canvas = this.canvasRef!.nativeElement;
    this.context = this.canvas.getContext('2d');

    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.gridDimentions = {
      width: Math.floor(this.canvas.width / this.cellSize),
      height: Math.floor(this.canvas.height / this.cellSize)
    };
    
    for (let i = 0; i < this.gridDimentions.width; ++i) {
      let column:CellContent[] = new Array<CellContent>();
      for (let j = 0; j < this.gridDimentions.height; ++j) {
        column.push(CellContent.Empty);
      }
      this.grid.push(column);
    }

    this.lastFrameTime = new Date().getTime();
    this.gameOver = false;

    this.position = {x: Math.floor(this.gridDimentions.width / 2),
                     y: Math.floor(this.gridDimentions.height / 2)};
    this.grid[this.position.x][this.position.y] = CellContent.Snake;
    this.snake.push({x: this.position.x, y: this.position.y});

    const numApple = 5;
    for (let i = 0; i < numApple; ++i) {
      this.addApple();
    }

    this.apple.src = 'https://opengameart.org/sites/default/files/Apple_2.png';
    this.apple.onload = () =>
      window.requestAnimationFrame(
        (time: DOMHighResTimeStamp) => this.animationFrame(time));
  }

  animationFrame(time: DOMHighResTimeStamp): void {
    const now = new Date().getTime();
    this.timeCounter += now - this.lastFrameTime;
    this.lastFrameTime = now;
    const speed = Math.min(3 + 0.3 * this.snake.length, 6);
    const nextFrame = 1000.0 / speed;
    if (this.timeCounter > nextFrame) {
      this.timeCounter -= nextFrame;
      this.step();
    }

    window.requestAnimationFrame(
      (time: DOMHighResTimeStamp) => this.animationFrame(time));
  }

  step(): void {
    this.moveSnake();

    if (this.gameOver) {
      this.context!.fillStyle = 'rgb(200,50,50)';
      this.context!.fillRect(
        0, 0, this.canvas!.width, this.canvas!.height);

      this.context!.fillStyle = 'black';
      this.context!.font = "30px Arial";
      this.context!.textAlign = "center";
      this.context!.fillText("Partie terminée!",
                             this.canvas!.width / 2,
                             this.canvas!.height / 2);

      this.context!.font = "18px Arial";
      this.context!.fillText("Appuyez sur une touche pour recommencer",
                             this.canvas!.width / 2,
                             this.canvas!.height / 2 + 45 );
    } else {
      this.context!.fillStyle = 'rgb(200,200,200)';
      this.context!.fillRect(
        0, 0, this.canvas!.width, this.canvas!.height);

      for (let i = 0; i < this.gridDimentions.width; ++i) {
        for (let j = 0; j < this.gridDimentions.height; ++j) {
          let content = this.grid[i][j];
          if (content == CellContent.Snake) {
            this.drawSnake({x: i, y: j});
          }
          if (content == CellContent.Apple) {
            this.drawApple({x: i, y: j});
          }
        }
      }
    }
  }

  drawSnake(pos: Point): void {
    this.context!.fillStyle = 'purple';
    this.context!.fillRect(
      pos.x * this.cellSize,
      pos.y * this.cellSize,
      this.cellSize, this.cellSize);
  }

  drawApple(pos: Point): void {
    this.context!.drawImage(this.apple,
                            (pos.x - 0.4) * this.cellSize,
                            (pos.y - 0.25) * this.cellSize,
                            this.cellSize*1.8, this.cellSize*1.8);
  }

  eatApple(pos: Point): boolean {
    let content = this.grid[pos.x][pos.y];
    if (content == CellContent.Apple) {
      this.grid[pos.x][pos.y] = CellContent.Empty;
      this.addApple();
      return true;
    }
    return false;
  }

  addApple(): void {
    while (true) {
      let pos = {
        x: Math.floor(Math.random() * this.gridDimentions.width),
        y: Math.floor(Math.random() * this.gridDimentions.height)
      };
      if (this.grid[pos.x][pos.y] == CellContent.Empty) {
        this.grid[pos.x][pos.y] = CellContent.Apple;
        return
      }
    }
  }

  moveSnake() {
    if (this.newDirection) {
      if (this.direction.x != 0 && this.newDirection.y != 0 ||
          this.direction.y != 0 && this.newDirection.x != 0) {
        this.direction = this.newDirection;
      }
      this.newDirection = null;
    }
  
    let newPos = {x: this.position.x + this.direction.x,
                  y: this.position.y + this.direction.y};
    if (newPos.x < 0 ||
        newPos.x > this.gridDimentions.width - 1 ||
        newPos.y < 0 ||
        newPos.y > this.gridDimentions.height - 1 ||
        this.grid[newPos.x][newPos.y] == CellContent.Snake) {
      this.gameOver = true;      
    } else {
      this.position.x += this.direction.x;
      this.position.y += this.direction.y;

      if (!this.eatApple(this.position)) {
        const tail = this.snake.shift();
        this.grid[tail!.x][tail!.y] = CellContent.Empty;
      }

      this.snake.push({x: this.position.x, y: this.position.y});
      this.grid[this.position.x][this.position.y] = CellContent.Snake;
    }
  }

  @HostListener('window:keydown.arrowUp')
  moveUp() {
    this.newDirection = {x: 0, y: -1};
  }

  @HostListener('window:keydown.arrowDown')
  moveDown() {
    this.newDirection = {x: 0, y: 1};
  }

  @HostListener('window:keydown.arrowLeft')
  moveLeft() {
    this.newDirection = {x: -1, y: 0};
  }

  @HostListener('window:keydown.arrowRight')
  moveRight() {
    this.newDirection = {x: 1, y: 0};
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.gameOver) {
      this.startGame();
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (this.gameOver) {
      this.startGame();
      return;
    }

    const ratio = this.canvas!.height / this.canvas!.width;

    let touch = event.touches[0] || event.changedTouches[0];
    if (touch.pageY < touch.pageX * ratio &&
        touch.pageY < (this.canvas!.width - touch.pageX) * ratio) {
      this.newDirection = {x: 0, y: -1};
    }
    else if (touch.pageX * ratio < touch.pageY &&
             touch.pageY < (this.canvas!.width - touch.pageX) * ratio) {
      this.newDirection = {x: -1, y: 0};
    }
    else if (touch.pageX * ratio < touch.pageY &&
             (this.canvas!.width - touch.pageX) * ratio < touch.pageY) {
      this.newDirection = {x: 0, y: 1};
    }
    else if (touch.pageX * ratio > touch.pageY &&
             touch.pageX * ratio > this.canvas!.height - touch.pageY) {
      this.newDirection = {x: 1, y: 0};
    }
  }
}
