  initGraphs(selectedSignals: ISignalKey[]) {
    const isAutoScale = this._rootStore.userSettingsPanelStore.isAutoScale;
    const isAddingNewPanel = this._rootStore.userSettingsPanelStore.isAddingNewPanel;

    const panelSelectedTags: string[] = selectedSignals.map((i: ISignalKey) => i.tagName);

    const existingTags: string[] = this.graphsConfigs.map((config: TGraphsConfigs) => {
      return config.id;
    });
    const newTags: string[] = panelSelectedTags.filter((tagName: string) => {
      return !existingTags.includes(tagName);
    });

    const tagsForDeleting: string[] = existingTags.filter((tag) => {
      return !panelSelectedTags.includes(tag) && !newTags.includes(tag) && tag !== BASEMENT_TAG_ID_FOR_INIT;
    });

    this.graphsConfigs = this.graphsConfigs.filter((i) => !tagsForDeleting.includes(i.id));

    const getLineSettings = (): LineStore => {
      return new LineStore(
        this._rootStore,
        COLORS_PALETTES[this._rootStore.userSettingsPanelStore.selectedColorPaletteName].colors[existingTags.length] ||
          COLORS_PALETTES[this._rootStore.userSettingsPanelStore.selectedColorPaletteName].colors[0]
      );
    };

    const getAxisId = (id: string, mode: 'x' | 'y'): string => {
      if (!existingTags.length) {
        return generateAxisId(BASEMENT_CHART_AREA_ID, mode);
      }
      // TODO: разкомментировать когад будет разделение панелей
      // if (isAddingNewPanel || isAutoScale) {
      if (isAddingNewPanel) {
        return generateAxisId(id, mode);
      }

      return generateAxisId(BASEMENT_CHART_AREA_ID, mode);
    };

    const getChartId = (): string => {
      return BASEMENT_CHART_AREA_ID;
    };

    const getYPanelId = (yPanelId: string): string => {
      if (!existingTags.length) {
        return BASEMENT_Y_PANEL_ID;
      }
      // TODO: разкомментировать когад будет разделение панелей
      // if (isAutoScale || isAddingNewPanel) {
      if (isAddingNewPanel) {
        return yPanelId;
      }
      return BASEMENT_Y_PANEL_ID;
    };

    const getAxesMode = (): AXES_MODES_ENUM => {
      if (!existingTags.length) {
        return AXES_MODES_ENUM.COMMON;
      }
      if (isAddingNewPanel) {
        return AXES_MODES_ENUM.SEPARATED_PANEL;
      }

      if (isAutoScale) {
        return AXES_MODES_ENUM.SEPARATED_Y;
      }
      return AXES_MODES_ENUM.COMMON;
    };

    const newTagsConfig: TGraphsConfigs[] = selectedSignals
      .filter((i: ISignalKey) => newTags.includes(i.tagName))
      .map((signal: ISignalKey) => {
        const id = `special_${signal.tagName}`;
        const yPanelId = generatePanelId();

        //  if (!isAddingNewPanel && isAutoScale && existingTags.length > 0) {
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

    this.graphsConfigs = [...this.graphsConfigs, ...newTagsConfig];
  }