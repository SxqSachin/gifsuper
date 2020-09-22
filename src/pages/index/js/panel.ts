import { Vue, Prop, } from 'vue-property-decorator';
import { Toasted } from '@/pages/index/js/type';
import { Desk } from './desk';

export interface Panel {
  tabInfo: { name: string, title: string, icon: string, new?: boolean };

  panelName: string;

  addToDesk(desk?: Desk);
}

export abstract class AbstractPanel extends Vue implements Toasted, Panel {
  // @Prop({})
  // public desk!: any;

  abstract tabInfo;
  abstract panelName;

  public toast(msg: string, type: string = 'info', duration: number = 3000) {
    // @ts-ignore
    this.$message(msg, { type, duration });
  }

  public addToDesk(desk: Desk) {
    // const desk = this.desk;
    // desk.panels.splice(desk.panels.length, 1, this);
    desk.tabs.splice(desk.tabs.length, 1, this.tabInfo);
  };
}