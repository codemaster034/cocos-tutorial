import {
  _decorator,
  Component,
  Node,
  Vec3,
  input,
  Input,
  EventMouse,
  Animation,
  SkeletalAnimation,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerController")
export class PlayerController extends Component {
  private _startJump: boolean = false;
  private _jumpStep: number = 0;
  private _curJumpTime: number = 0;
  private _jumpTime: number = 0.7;
  private _curJumpSpeed: number = 0;
  private _curPos: Vec3 = new Vec3();
  private _deltaPos: Vec3 = new Vec3(0, 0, 0);
  private _targetPos: Vec3 = new Vec3();
  private _isMoving: boolean = false;
  private _curMoveIndex: number = 0;

  @property({ type: Animation })
  public BodyAnim: Animation | null = null;
  @property({ type: SkeletalAnimation })
  public CocosAnim: SkeletalAnimation | null = null;

  start() {
    // input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
  }

  reset() {
    this._curMoveIndex = 0;
  }

  setInputActive(active: boolean) {
    if (active) {
      input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    } else {
      input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }
  }

  onMouseUp(event: EventMouse) {
    if (event.getButton() === 0) {
      this.jumpByStep(1);
    } else if (event.getButton() === 2) {
      this.jumpByStep(2);
    }
  }

  jumpByStep(step: number) {
    if (this._isMoving) return;
    this._startJump = true;
    this._jumpStep = step;
    this._curJumpTime = 0;
    this._curJumpSpeed = this._jumpStep / this._jumpTime;
    this.node.getPosition(this._curPos);
    Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep, 0, 0));

    this._isMoving = true;
    this._curMoveIndex += step;

    if (this.CocosAnim) {
      // The jumping animation takes a long time, here is accelerated playback
      this.CocosAnim.getState("cocos_anim_jump").speed = 2.5;
      // Play jumping animation
      this.CocosAnim.play("cocos_anim_jump");
    }

    if (this.BodyAnim) {
      if (step === 1) {
        // this.BodyAnim.play("oneStep");
      } else if (step === 2) {
        this.BodyAnim.play("twoStep");
      }
    }
  }

  onOnceJumpEnd() {
    this._isMoving = false;
    if (this.CocosAnim) {
      this.CocosAnim.play("cocos_anim_idle");
    }
    this.node.emit("JumpEnd", this._curMoveIndex);
  }

  update(deltaTime: number) {
    if (this._startJump) {
      this._curJumpTime += deltaTime;
      if (this._curJumpTime > this._jumpTime) {
        this.node.setPosition(this._targetPos);
        this._startJump = false;
        this.onOnceJumpEnd();
      } else {
        this.node.getPosition(this._curPos);
        this._deltaPos.x = this._curJumpSpeed * deltaTime;
        Vec3.add(this._curPos, this._curPos, this._deltaPos);
        this.node.setPosition(this._curPos);
      }
    }
  }
}
