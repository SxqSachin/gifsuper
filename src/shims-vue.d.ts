import Vue, { VNode } from 'vue';

declare module "*.vue" {
    import Vue from "vue";
    export default Vue;
}