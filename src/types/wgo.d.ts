declare namespace WGo {
  type B = 1;
  type W = -1;
  const White: number;

  class Position {
    size: number;
    constructor(size?: number);
    get(x: number, y: number): any;
    set(x: number, y: number, value: any): void;
    clear(): void;
    clone(): Position;
    schema: number[];
    capCount: {
      black: number;
      white: number;
    };
    color: B | W;
  }

  class Game {
    size: number;
    repeating: string;
    turn: -1 | 1;
    stack: Position[];
    constructor(size: number);
    getPosition(): Position;
    pushPosition(positions: Position);
    firstPosition();
    popPosition(): Position;
    pass(): void;
    isValid(x: number, y: number, color?: number): boolean;
    play(
      x: number,
      y: number,
      color?: W | B,
      noPlay?: boolean
    ): { x: number; y: number }[] | number;
  }
}
