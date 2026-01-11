export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate'
    },
    header: {
      slots: {
        root: 'bg-background/50 backdrop-blur-sm min-h-[20px]'
      }
    }
  }
})
