import { useAuth } from "@api";
import { useRefetchOnFocus } from "@api/queryClient";
import { useArchivedTasks } from "@api/resources/archivedTasks";
import { CopySuccessIcon, NoteTextIcon } from "@assets/icons";
import type { TaskGroupType } from "@models/task";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { formatDate } from "@tools/date";
import tw from "@tools/tailwind";
import { Loader } from "@uikit/atoms";
import { HelpButton, IconButton } from "@uikit/atoms/buttons";
import { SearchInput, SwitchSelector } from "@uikit/atoms/form";
import { HistoryTasksList } from "@uikit/organisms/lists";
import { useModalsActions } from "@uikit/organisms/modals";
import { rgba } from "polished";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, StatusBar, Text, View } from "react-native";
import { useDebounce } from "use-debounce";
import type { HomeTabScreenProps } from ".";

export interface HistoryForm {
  searchQuery: string;
  groupType: TaskGroupType;
}

const HistoryScreen = () => {
  const { t } = useTranslation();

  const navigation =
    useNavigation<HomeTabScreenProps<"History">["navigation"]>();

  const authQuery = useAuth();

  const modalsActions = useModalsActions();

  const headerHeight = useHeaderHeight();
  const statusBarHeight = StatusBar.currentHeight || 0;

  const [historyDate, setHistoryDate] = useState<Date>(new Date());

  const { control, watch } = useForm<HistoryForm>({
    defaultValues: {
      searchQuery: "",
      groupType: "TASK",
    },
    mode: "onChange",
  });

  const { groupType, searchQuery } = watch();

  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  const archivedTasksQuery = useArchivedTasks({
    group: groupType === "GROUP",
    searchQuery: debouncedSearchQuery,
    date: formatDate(historyDate, "isoDate"),
  });

  // TODO: add this for teams and groups
  useRefetchOnFocus(archivedTasksQuery.refetch);

  const onOpenCalendar = () => {
    modalsActions.openModal("calendarModal", {
      onChange: setHistoryDate,
      currentDate: historyDate,
      maxDate: new Date(),
      onClose: () => modalsActions.hideModal("calendarModal"),
    });
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={tw`flex-row pl-5 items-center`}>
          <IconButton
            icon="calendarIcon"
            iconProps={{
              stroke: tw.color("purple-800"),
              strokeWidth: 1.5,
              height: 24,
              width: 24,
            }}
            onPress={onOpenCalendar}
            style={tw`mr-[15px] border-gray-500 h-[40px] w-[40px]`}
          />

          <Text
            numberOfLines={1}
            style={tw`flex-1 font-gilroy-semibold text-2xl text-purple-800`}
          >
            {t("screens.history.title")}
          </Text>
        </View>
      ),
      headerRight: () => (
        <HelpButton
          style={tw`mr-5`}
          title={t("ui.help.history.title")}
          description={t("ui.help.history.description")}
        />
      ),
    });
  }, [navigation, historyDate]);

  const onPressTask = (id: string, date: string) => {
    navigation.navigate("TaskInfo", { taskId: id, date });
  };

  const onEdit = (taskId: string) => {
    navigation.navigate("CreateOrUpdateTask", {
      taskId,
      openDetails: true,
    });
  };

  const onReUse = () => {
    navigation.navigate("Main");
  };

  const switchOptions = [
    {
      label: t("ui.modals.create_task.selector.task"),
      value: "TASK",
      customIcon: (
        <NoteTextIcon
          stroke={
            groupType === "TASK" ? tw.color("white") : tw.color("purple-100")
          }
          strokeWidth={1.5}
          style={tw`mr-3`}
        />
      ),
    },
    {
      label: t("ui.modals.create_task.selector.group"),
      value: "GROUP",
      customIcon: (
        <CopySuccessIcon
          stroke={
            groupType === "GROUP" ? tw.color("white") : tw.color("purple-100")
          }
          strokeWidth={1.5}
          style={tw`mr-3`}
        />
      ),
    },
  ];

  if (!authQuery.isSuccess || !authQuery.data) {
    return null;
  }

  return (
    <View style={tw`flex-1 bg-gray-90`}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        keyboardVerticalOffset={headerHeight + statusBarHeight}
        behavior="padding"
      >
        <View style={tw`px-5 pt-[18px]`}>
          <SwitchSelector
            name="groupType"
            control={control}
            options={switchOptions}
            style={{ backgroundColor: rgba(tw.color("gray-525")!, 0.2) }}
          />

          <SearchInput
            control={control}
            name="searchQuery"
            placeholder={
              groupType === "TASK"
                ? t("screens.history.placeholders.search.task")
                : t("screens.history.placeholders.search.group")
            }
            placeholderTextColor={rgba(tw.color("purple-800")!, 0.4)}
            containerStyle={tw`mt-5`}
          />
        </View>

        {archivedTasksQuery.isLoading && (
          <View style={tw`flex-1 justify-center items-center`}>
            <Loader />
          </View>
        )}

        {archivedTasksQuery.isSuccess && (
          <HistoryTasksList
            userRole={authQuery.data.role}
            data={archivedTasksQuery.data.pages.flat()}
            onPressTask={onPressTask}
            hasNextPage={archivedTasksQuery.hasNextPage}
            fetchNextPage={archivedTasksQuery.fetchNextPage}
            onEdit={onEdit}
            onSuccessReUse={onReUse}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default HistoryScreen;
