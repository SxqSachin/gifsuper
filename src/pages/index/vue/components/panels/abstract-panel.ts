import { Vue, } from 'vue-property-decorator';
import { Toasted } from '@/pages/index/js/type';

export class AbstractPanel extends Vue implements Toasted {

  public toast(msg: string, type: string = 'info', duration: number = 3000) {
    // @ts-ignore
    this.$message(msg, { type, duration });
  }
}