// 'use client';
//
// import { useEffect, useState } from 'react';
// import { badgeClasses, Box, Button, Link, paperClasses, Popover, Stack } from '@mui/material';
// import { notifications as notificationsData } from 'data/notifications';
// import dayjs from 'dayjs';
// import { useSettingsContext } from '@beep/ui/settings-v2/SettingsProvider';
// import paths from '@beep/ui/layouts/main-layout/paths';
// import { DatewiseNotification } from 'types/notification';
// import {Iconify} from '@beep/ui/atoms';
// import SimpleBar from 'components/base/SimpleBar';
// import NotificationList from 'components/sections/notification/NotificationList';
// import OutlinedBadge from 'components/styled/OutlinedBadge';
//
// interface NotificationMenuProps {
//   type?: 'default' | 'slim';
// }
//
// const NotificationMenu = ({ type = 'default' }: NotificationMenuProps) => {
//   const [notifications, setNotifications] = useState<DatewiseNotification>({
//     today: [],
//     older: [],
//   });
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//
//   const {
//     config: { textDirection },
//   } = useSettingsContext();
//
//   const open = Boolean(anchorEl);
//   const handleClick = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget);
//   };
//   const handleClose = () => {
//     setAnchorEl(null);
//   };
//
//   useEffect(() => {
//     const datewiseNotification = notificationsData.reduce(
//       (acc: DatewiseNotification, val) => {
//         if (dayjs().diff(dayjs(val.createdAt), 'days') === 0) {
//           acc.today.push(val);
//         } else {
//           acc.older.push(val);
//         }
//         return acc;
//       },
//       {
//         today: [],
//         older: [],
//       },
//     );
//
//     setNotifications(datewiseNotification);
//   }, [notificationsData]);
//
//   return (
//     <>
//       <Button
//         color="neutral"
//         variant={type === 'default' ? 'soft' : 'text'}
//         shape="circle"
//         size={type === 'slim' ? 'small' : 'medium'}
//         onClick={handleClick}
//       >
//         <OutlinedBadge
//           variant="dot"
//           color="error"
//           sx={{
//             [`& .${badgeClasses.badge}`]: {
//               height: 10,
//               width: 10,
//               top: -2,
//               right: -2,
//               borderRadius: '50%',
//             },
//           }}
//         >
//           <Iconify
//             icon={
//               type === 'slim'
//                 ? 'material-symbols:notifications-outline-rounded'
//                 : 'material-symbols-light:notifications-outline-rounded'
//             }
//             sx={{ fontSize: type === 'slim' ? 18 : 22 }}
//           />
//         </OutlinedBadge>
//       </Button>
//       <Popover
//         anchorEl={anchorEl}
//         id="notification-menu"
//         open={open}
//         onClose={handleClose}
//         transformOrigin={{
//           horizontal: textDirection === 'rtl' ? 'left' : 'right',
//           vertical: 'top',
//         }}
//         anchorOrigin={{
//           horizontal: textDirection === 'rtl' ? 'left' : 'right',
//           vertical: 'bottom',
//         }}
//         sx={{
//           [`& .${paperClasses.root}`]: {
//             width: 400,
//             height: 650,
//             display: 'flex',
//             flexDirection: 'column',
//           },
//         }}
//       >
//         <Box sx={{ pt: 2, flex: 1, overflow: 'hidden' }}>
//           <SimpleBar disableHorizontal>
//             <NotificationList
//               title="Today"
//               notifications={notifications.today}
//               variant="small"
//               onItemClick={handleClose}
//             />
//             <NotificationList
//               title="Older"
//               notifications={notifications.older}
//               variant="small"
//               onItemClick={handleClose}
//             />
//           </SimpleBar>
//         </Box>
//         <Stack
//           sx={{
//             justifyContent: 'center',
//             alignItems: 'center',
//             py: 1,
//           }}
//         >
//           <Button
//             component={Link}
//             underline="none"
//             href={paths.notifications}
//             variant="text"
//             color="primary"
//           >
//             Load more notifications
//           </Button>
//         </Stack>
//       </Popover>
//     </>
//   );
// };
//
// export default NotificationMenu;
