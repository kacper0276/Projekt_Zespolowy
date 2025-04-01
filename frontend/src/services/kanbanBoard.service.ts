class KanbanBoardService {
  private static instance: KanbanBoardService;

  private constructor() {}

  public static getInstance(): KanbanBoardService {
    if (!KanbanBoardService.instance) {
      KanbanBoardService.instance = new KanbanBoardService();
    }
    return KanbanBoardService.instance;
  }
}

export default KanbanBoardService.getInstance();
