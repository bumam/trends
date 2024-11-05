initGraphs(selectedSignals: ISignalKey[]) {
  const { isAutoScale, isAddingNewPanel, selectedColorPaletteName } = this._rootStore.userSettingsPanelStore;
  
  // Получаем существующие теги из конфигураций
  const existingTags = this.graphsConfigs.map((config: TGraphsConfigs) => config.id);

  // Получаем теги, которые выбраны, но ещё не добавлены в конфигурацию
  const panelSelectedTags = selectedSignals.map(signal => signal.tagName);
  const newTags = panelSelectedTags.filter(tagName => !existingTags.includes(tagName));

  // Получаем теги для удаления
  const tagsForDeleting = existingTags.filter(tag => !panelSelectedTags.includes(tag) && tag !== BASEMENT_TAG_ID_FOR_INIT);

  // Удаляем графики с тегами, которые не выбраны
  this.graphsConfigs = this.graphsConfigs.filter(graphConfig => !tagsForDeleting.includes(graphConfig.id));

  // Функция для получения настроек линии
  const getLineSettings = () => {
    const colors = COLORS_PALETTES[selectedColorPaletteName].colors;
    return new LineStore(
      this._rootStore,
      colors[existingTags.length] || colors[0]
    );
  };

  // Функция для генерации ID оси
  const getAxisId = (id: string, mode: 'x' | 'y'): string => {
    if (!existingTags.length) {
      return generateAxisId(BASEMENT_CHART_AREA_ID, mode);
    }
    return isAddingNewPanel ? generateAxisId(id, mode) : generateAxisId(BASEMENT_CHART_AREA_ID, mode);
  };

  // Функция для получения ID графика
  const getChartId = (): string => BASEMENT_CHART_AREA_ID;

  // Функция для получения ID панели Y
  const getYPanelId = (yPanelId: string): string => {
    if (!existingTags.length || isAddingNewPanel) {
      return yPanelId;
    }
    return BASEMENT_Y_PANEL_ID;
  };

  // Функция для получения режима осей
  const getAxesMode = (): AXES_MODES_ENUM => {
    if (!existingTags.length) {
      return AXES_MODES_ENUM.COMMON;
    }
    return isAddingNewPanel ? AXES_MODES_ENUM.SEPARATED_PANEL : (isAutoScale ? AXES_MODES_ENUM.SEPARATED_Y : AXES_MODES_ENUM.COMMON);
  };

  // Создаём конфигурацию для новых тегов
  const newTagsConfig: TGraphsConfigs[] = selectedSignals
    .filter(signal => newTags.includes(signal.tagName))
    .map(signal => {
      const id = `special_${signal.tagName}`;
      const yPanelId = generatePanelId();

      // Добавляем график в панель, если это новый график
      if (isAddingNewPanel && existingTags.length > 0) {
        this._rootStore.connectedPanelsStore.addChartToPanel(
          BASEMENT_CHART_AREA_ID,
          id,
          yPanelId,
          BASEMENT_CHART_AREA_ID,
          AXES_MODES_ENUM.SEPARATED_PANEL
        );
      }

      return {
        id: signal.tagName,
        axesMode: getAxesMode(),
        isNeedAutoScale: isAutoScale,
        isVisibleLine: true,
        label: signal.label || '',
        objectLabel: signal.objectLabel || '',
        lineSettings: getLineSettings(),
        axisXId: getAxisId(id, 'x'),
        axisYId: getAxisId(id, 'y'),
        chartId: getChartId(),
        panelId: getYPanelId(yPanelId),
        mainAxisXId: generateAxisId(BASEMENT_CHART_AREA_ID, 'x'),
      };
    });

  // Обновляем конфигурации графиков с новыми значениями
  this.graphsConfigs = [...this.graphsConfigs, ...newTagsConfig];
}
